import { Prisma } from "@prisma/client";
import { z } from "zod";
import { BadRequestException } from "../exceptions/bad-request";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";
import { HTTPSuccessResponse } from "../helpers/success-response";
import { formatPaginationResponse } from "../utils/common-method";
import prisma from "../utils/prisma";
import { hotelSchema, roomSchema, RoomType } from "../schemas/hotels";

type HotelPayload = z.infer<typeof hotelSchema>;

export const upsertHotel = async (params: {
  hotelId: number | null;
  data: HotelPayload;
}) => {
  const { name, location, description, amenities, image, rooms } = params.data;

  let hotel;

  if (params.hotelId) {
    hotel = await prisma.hotel.update({
      where: { id: params.hotelId },
      data: { name, location, image, description, amenities },
    });
  } else {
    hotel = await prisma.hotel.create({
      data: { name, location, image, description, amenities },
    });
  }

  if (rooms?.length) {
    const validRooms = rooms
      .map((room) => roomSchema.safeParse(room))
      .filter((res) => res.success)
      .map((res) => res.data);

    const existingRooms = await prisma.room.findMany({
      where: { hotelId: hotel.id },
      select: { id: true },
    });

    const existingRoomIds = new Set(existingRooms.map((room) => room.id));
    const incomingRoomIds = new Set(validRooms.map((room) => room.id).filter(Boolean));

    const roomsToDelete = [...existingRoomIds].filter((id) => !incomingRoomIds.has(id));

    if (roomsToDelete.length > 0) {
      await prisma.room.deleteMany({
        where: { id: { in: roomsToDelete } },
      });
    }

    await Promise.all(
      validRooms.map(async ({ id, roomType, price, image, amenities, quantity }) => {
        if (id) {
          await prisma.room.update({
            where: { id },
            data: { roomType, price: +price, image, amenities, quantity },
          });
        } else {
          await prisma.room.create({
            data: { hotelId: hotel.id, roomType, price: +price, image, amenities, quantity },
          });
        }
      })
    );
  } else {
    await prisma.room.deleteMany({
      where: { hotelId: hotel.id },
    });
  }

  return new HTTPSuccessResponse(
    `Hotel ${params.hotelId ? "updated" : "created"} successfully`,
    params.hotelId ? 200 : 201,
    hotel
  );
};

export const removeHotel = async (hotelId: number) => {
  const hotel = await prisma.hotel.findUnique({
    where: { id: hotelId },
    include: { rooms: true },
  });

  if (!hotel) {
    throw new NotFoundException("Hotel not found", ErrorCode.HOTEL_NOT_FOUND);
  }

  await prisma.room.deleteMany({
    where: { hotelId },
  });

  await prisma.hotel.delete({
    where: { id: hotelId },
  });

  return new HTTPSuccessResponse("Hotel deleted successfully", 200, hotel);
};

export const fetchHotels = async (params: { page?: number; limit?: number }) => {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const skip = (page - 1) * limit;

  const hotels = await prisma.hotel.findMany({ skip, take: limit, include: { rooms: true } });
  const totalHotels = await prisma.hotel.count();

  const formattedResponse = formatPaginationResponse(hotels ?? [], totalHotels, page, limit);

  return new HTTPSuccessResponse("Hotels fetched successfully", 200, formattedResponse);
};

export const fetchHotelDetails = async (hotelId: number) => {
  const hotel = await prisma.hotel.findUnique({
    where: { id: hotelId },
    include: {
      rooms: true,
      reviews: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!hotel) {
    throw new NotFoundException("Hotel not found", ErrorCode.HOTEL_NOT_FOUND);
  }

  return new HTTPSuccessResponse("Hotel details fetched successfully", 200, hotel);
};

export const searchHotels = async (params: {
  location?: string;
  minPrice?: string;
  maxPrice?: string;
  roomType?: string;
  name?: string;
  page?: number;
  limit?: number;
}) => {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const skip = (page - 1) * limit;

  const whereClause = {
    ...(params.location && {
      location: {
        contains: params.location,
        mode: Prisma.QueryMode.insensitive,
      },
    }),
    ...(params.name && {
      name: {
        contains: params.name,
        mode: Prisma.QueryMode.insensitive,
      },
    }),
    rooms: {
      some: {
        ...(params.minPrice && { price: { gte: +params.minPrice } }),
        ...(params.maxPrice && { price: { lte: +params.maxPrice } }),
        ...(params.roomType && { roomType: params.roomType as RoomType }),
      },
    },
  };

  const hotels = await prisma.hotel.findMany({
    where: whereClause,
    include: { rooms: true },
    skip,
    take: limit,
  });

  const totalHotels = await prisma.hotel.count({
    where: whereClause,
  });

  if (!hotels) {
    throw new NotFoundException("Something went wrong", 404);
  }

  const formattedResponse = formatPaginationResponse(hotels ?? [], totalHotels, page, limit);

  return new HTTPSuccessResponse("Hotels fetched successfully", 200, formattedResponse);
};

export const checkRoomAvailabilityService = async (params: {
  roomId?: number;
  date?: string;
  quantity?: number;
}) => {
  const { roomId, date, quantity } = params;

  if (!roomId || !date || !quantity) {
    throw new BadRequestException("Missing required parameters", ErrorCode.BAD_REQUEST);
  }

  const room = await prisma.room.findUnique({
    where: { id: roomId },
    select: { quantity: true },
  });

  if (!room) {
    throw new NotFoundException("Room not found", ErrorCode.ROOM_NOT_FOUND);
  }

  const bookings = await prisma.booking.findMany({
    where: {
      roomId,
      bookingDate: new Date(date),
      status: "CONFIRMED",
    },
  });

  const totalBookedRooms = bookings.reduce(
    (total, booking) => total + (booking.roomQuantity ?? 0),
    0
  );

  const requestedQuantity = Number(quantity);

  const isAvailable = totalBookedRooms + requestedQuantity <= room.quantity;

  const availAbality = room.quantity - totalBookedRooms;

  return new HTTPSuccessResponse("Table availability checked successfully", 200, {
    isAvailable,
    availAbality,
  });
};
