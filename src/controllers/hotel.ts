
import { Request, Response } from "express";
import prisma from "../connect";
import { HTTPSuccessResponse } from "../helpers/success-response";

import {
  hotelSchema,
  roomSchema,
  RoomType,
} from "../schema/hotels";
import { formatPaginationResponse, handleValidationError } from "../utils/common-method";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";
import { Prisma } from "@prisma/client";




export const CreateUpdateHotel = async (req: Request, res: Response) => {
  // ✅ Validate hotel data
  const validation = hotelSchema.safeParse(req.body);
  if (!validation.success) return handleValidationError(res, validation);

  const { name, location, description, amenities, image, rooms } = validation.data;
  const hotelId = req.params.id ? +req.params.id : null;

  let hotel;

  if (hotelId) {
    // ✅ **Update Hotel**
    hotel = await prisma.hotel.update({
      where: { id: hotelId },
      data: { name, location, image, description, amenities },
    });
  } else {
    // ✅ **Create Hotel**
    hotel = await prisma.hotel.create({
      data: { name, location, image, description, amenities },
    });
  }

  // 🏨 **Process Rooms (if provided & valid)**
  if (rooms?.length) {
    const validRooms = rooms
      .map((room) => roomSchema.safeParse(room))
      .filter((res) => res.success)
      .map((res) => res.data); // Extract only valid room data

    // 🔍 **Fetch Existing Rooms for Hotel**
    const existingRooms = await prisma.room.findMany({
      where: { hotelId: hotel.id },
      select: { id: true }, // Only fetch room IDs
    });

    const existingRoomIds = new Set(existingRooms.map((room) => room.id));
    const incomingRoomIds = new Set(validRooms.map((room) => room.id).filter(Boolean));

    // 🔥 **Delete Rooms That Are No Longer in the Request**
    const roomsToDelete = [...existingRoomIds].filter((id) => !incomingRoomIds.has(id));

    if (roomsToDelete.length > 0) {
      await prisma.room.deleteMany({
        where: { id: { in: roomsToDelete } },
      });
    }

    // 🔄 **Process Each Room (Create or Update)**
    await Promise.all(
      validRooms.map(async ({ id, roomType, price, image, amenities }) => {
        if (id) {
          // ✅ Update Existing Room
          await prisma.room.update({
            where: { id },
            data: { roomType, price: +price, image, amenities },
          });
        } else {
          // ✅ Create New Room
          await prisma.room.create({
            data: { hotelId: hotel.id, roomType, price: +price, image, amenities },
          });
        }
      })
    );
  } else {
    // 🔥 If rooms array is empty, delete all existing rooms for the hotel
    await prisma.room.deleteMany({
      where: { hotelId: hotel.id },
    });
  }

  // 📤 **Return Response**
  return res.status(hotelId ? 200 : 201).json(
    new HTTPSuccessResponse(
      `Hotel ${hotelId ? "updated" : "created"} successfully`,
      hotelId ? 200 : 201,
      hotel
    )
  );
};


// Delete a Hotel
export const deleteHotel = async (req: Request, res: Response) => {
  const hotelId = +req.params.id;

  const hotel = await prisma.hotel.findUnique({
    where: { id: hotelId },
    include: { rooms: true }, // Fetch related rooms
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


  const response = new HTTPSuccessResponse(
    "Hotel deleted successfully",
    200,
    hotel
  );
  return res.status(response.statusCode).json(response);
}

// Get All Hotels
export const getHotels = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  // Fetch roles with pagination
  const hotels = await prisma.hotel.findMany({ skip, take: limit, include: { rooms: true } });
  const totalHotels = await prisma.hotel.count();

  if (!hotels || hotels.length === 0) {
    throw new NotFoundException("No hotels found", ErrorCode.HOTEL_NOT_FOUND);
  }

  const formattedResponse = formatPaginationResponse(hotels, totalHotels, page, limit);

  const response = new HTTPSuccessResponse(
    "Hotels fetched successfully",
    200,
    formattedResponse
  );
  return res.status(response.statusCode).json(response);
}

// Get Detailed Hotel Information including Rooms
export const getHotelDetails = async (req: Request, res: Response) => {
  const hotelId = +req.params.id;
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

  const response = new HTTPSuccessResponse(
    "Hotel details fetched successfully",
    200,
    hotel
  );
  res.status(response.statusCode).json(response);
};


// Search Hotels by Location, Room Type, and Price Range
export const searchHotels = async (req: Request, res: Response) => {

  const { location, minPrice, maxPrice, roomType, name } = req.query;

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;


  const whereClause = {
    ...(location && { location:  {
      contains: location as string,
      mode: Prisma.QueryMode.insensitive,
    }}),
    ...(name && {
      name: {
        contains: name as string,
        mode: Prisma.QueryMode.insensitive,
      },
    }),
    rooms: {
      some: {
        ...(minPrice && { price: { gte: +minPrice } }),
        ...(maxPrice && { price: { lte: +maxPrice } }),
        ...(roomType && { roomType: roomType as RoomType }),
      },
    },
  }

  // Fetch paginated data
  const hotels = await prisma.hotel.findMany({
    where: whereClause,
    include: { rooms: true },
    skip,
    take: limit,
  });

  const totalHotels = await prisma.hotel.count({
    where: whereClause,
  });


  if (!hotels || hotels.length === 0) {
    throw new NotFoundException("No hotels found", ErrorCode.HOTEL_NOT_FOUND);
  }

  const formattedResponse = formatPaginationResponse(hotels, totalHotels, page, limit);

  const response = new HTTPSuccessResponse(
    "Hotels fetched successfully",
    200,
    formattedResponse
  );
  res.status(response.statusCode).json(response);
};



// Cancel Booking
export const cancelBooking = async (req: Request, res: Response) => {
  const bookingId = +req.params.id;

  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  });

  const response = new HTTPSuccessResponse(
    "Booking cancelled successfully",
    200,
    booking
  );
  res.status(response.statusCode).json(response);
};
