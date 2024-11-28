import { NotFoundException } from "./../exceptions/not-found";
import { Request, Response } from "express";
import prisma from "../connect";
import { HTTPSuccessResponse } from "../helpers/success-response";
import { ErrorCode } from "../exceptions/root";
import {
  hotelSchema,
  hotelUpdateSchema,
  roomBookingSchema,
  roomSchema,
  RoomType,
} from "../schema/hotels";
import { handleValidationError } from "../utils/common-method";
import { InternalException } from "../exceptions/internal-exception";

export const createHotel = async (req: Request, res: Response) => {
  const validateResult = hotelSchema.safeParse({
    ...req.body,
    image: req.file?.path,
  });
  handleValidationError(res, validateResult);

  const { name, location } = validateResult.data!;
  const imageUrl = req.file ? req.file.path : null;

  const hotel = await prisma.hotel.create({
    data: {
      name,
      location,
      image: imageUrl,
    },
  });

  res.json(new HTTPSuccessResponse("Hotel created successfully", 201, hotel));
};

export const updateHotel = async (req: Request, res: Response) => {
  // Step 1: Validate the input using hotelUpdateSchema
  const validateResult = hotelUpdateSchema.safeParse({
    ...(req.body.name ? { name: req.body.name } : {}),
    ...(req.body.location ? { location: req.body.location } : {}),
    ...(req.file ? { image: req.file.path } : {}),
  });

  // Step 2: Check if validation was successful
  if (!validateResult.success) {
    // Return early if validation fails
    return handleValidationError(res, validateResult);
  }

  // Step 3: Extract validated data
  const { name, location, image } = validateResult.data;

  // Step 4: Construct update data with only provided fields
  const updateData = {
    ...(name && { name }),
    ...(location && { location }),
    ...(image && { image }),
  };

  const hotel = await prisma.hotel.update({
    where: { id: +req.params.id },
    data: updateData,
  });

  // Step 6: Send success response
  res.json(new HTTPSuccessResponse("Hotel updated successfully", 200, hotel));
};

// Get All Hotels
export const getHotels = async (req: Request, res: Response) => {
  const hotels = await prisma.hotel.findMany({
    include: { rooms: true },
  });
  res.json(new HTTPSuccessResponse("Hotels fetched successfully", 200, hotels));
};

// Get Detailed Hotel Information including Rooms
export const getHotelDetails = async (req: Request, res: Response) => {
  const hotelId = +req.params.id;
  const hotel = await prisma.hotel.findUnique({
    where: { id: hotelId },
    include: {
      rooms: true,
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

export const createRoom = async (req: Request, res: Response) => {
  const validateResult = roomSchema.safeParse({
    ...req.body,
    image: req.file?.path,
  });
  const hotelId = +req.params.id;
  const { roomType, price, image } = validateResult.data!;

  const roomData = {
    hotelId,
    roomType,
    price: +price,
    image,
  };

  // Check if the hotel exists
  const hotel = await prisma.hotel.findUnique({
    where: { id: hotelId },
  });

  if (!hotel) {
    throw new InternalException(
      "Hotel not found",
      "",
      ErrorCode.HOTEL_NOT_FOUND
    );
  }

  // Create the room under the hotel
  const newRoom = await prisma.room.create({
    data: roomData,
  });

  res.json(new HTTPSuccessResponse("Hotel created successfully", 201, newRoom));
};

export const updateRoom = async (req: Request, res: Response) => {
  const hotelId = +req.params.id;
  const { roomId, roomType, price } = req.body;

  const roomData = {
    hotelId,
    roomType,
    price: +price,
    image: req.file ? req.file.path : null,
  };

  try {
    // Check if the hotel exists
    const existingHotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
    });

    if (!existingHotel) {
      throw new InternalException(
        "Hotel not found",
        "",
        ErrorCode.HOTEL_NOT_FOUND
      );
    }

    const existingRoom = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!existingRoom) {
      throw new InternalException(
        "Room not found",
        "",
        ErrorCode.ROOM_NOT_FOUND
      );
    }

    // Create the room under the hotel
    const updatedRoom = await prisma.room.update({
      where: { id: roomId },
      data: roomData,
    });

    res.json(
      new HTTPSuccessResponse("Updated room successfully", 201, updatedRoom)
    );
  } catch (error) {
    console.error("Error creating room:", error);
    throw error;
  }
};

// Search Hotels by Location, Room Type, and Price Range
export const searchHotels = async (req: Request, res: Response) => {
  const { location, minPrice, maxPrice, roomType } = req.query;
  const hotels = await prisma.hotel.findMany({
    where: {
      location: location as string,
      rooms: {
        some: {
          price: {
            gte: minPrice ? +minPrice : undefined,
            lte: maxPrice ? +maxPrice : undefined,
          },
          roomType: { equals: roomType as RoomType },
        },
      },
    },
    include: {
      rooms: true,
    },
  });

  const response = new HTTPSuccessResponse(
    "Hotels fetched successfully",
    200,
    hotels
  );
  res.status(response.statusCode).json(response);
};

// Book a Room
export const bookRoom = async (req: Request, res: Response) => {
  // Validate request data
  const validateResult = roomBookingSchema.safeParse({
    ...req.body,
    userId: req.user?.id,
  });

  if (!validateResult.success) {
    handleValidationError(res, validateResult);
  }

  const { userId, roomId, bookingDate, quantity } = validateResult.data!;

  // Find the room
  const room = await prisma.room.findUnique({
    where: { id: roomId },
  });

  if (!room) {
    throw new NotFoundException("Room not found", ErrorCode.ROOM_NOT_FOUND);
  }

  // Calculate total price
  const totalPrice = room.price * Number(quantity);

  // Create booking
  const booking = await prisma.booking.create({
    data: {
      userId,
      roomId,
      bookingDate: new Date(bookingDate),
      totalPrice,
      status: "CONFIRMED",
    },
  });

  // Send success response
  const response = new HTTPSuccessResponse(
    "Room booked successfully",
    201,
    booking
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
