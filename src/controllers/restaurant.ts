import { Request, Response } from "express";
import prisma from "../connect";
import { HTTPSuccessResponse } from "../helpers/success-response";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";
import { InternalException } from "../exceptions/internal-exception";
import { reservationSchema, updateStatusSchema } from "../schema/booking";
import { BadRequestException } from "../exceptions/bad-request";
import { handleValidationError } from "../utils/common-method";

export const createRestaurant = async (req: Request, res: Response) => {
  const { name, location, cuisine, seats, menu } = req.body;
  try {
    // Check if an image file was uploaded
    const imageUrl = req.file ? req.file.path : null;

    const restaurant = await prisma.restaurant.create({
      data: { name, location, cuisine, image: imageUrl, seats: +seats, menu },
    });
    res.json(
      new HTTPSuccessResponse(
        "Restaurant created successfully",
        201,
        restaurant
      )
    );
  } catch (error) {
    throw new InternalException(
      "Failed to create restaurant",
      error,
      ErrorCode.INTERNAL_EXCEPTION
    );
  }
};

export const updateRestaurant = async (req: Request, res: Response) => {
  const restaurantId = +req.params.id;
  const { name, location, cuisine, seats, menu } = req.body;
  // Check if an image file was uploaded
  const imageUrl = req.file ? req.file.path : null;

  // Build update data dynamically to only include provided fields
  const restaurantData: Record<string, any> = {};

  if (name) restaurantData.name = name;
  if (location) restaurantData.location = location;
  if (cuisine) restaurantData.cuisine = cuisine;
  if (seats) restaurantData.seats = +seats; // Convert seats to a number
  if (menu) restaurantData.menu = menu;
  if (imageUrl) restaurantData.image = imageUrl;

  const restaurant = await prisma.restaurant.update({
    where: { id: restaurantId },
    data: restaurantData,
  });

  res.json(
    new HTTPSuccessResponse("Restaurant updated successfully", 200, restaurant)
  );
};

export const getAllRestaurants = async (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query;

  const restaurants = await prisma.restaurant.findMany({
    skip: (+page - 1) * +limit,
    take: +limit,
    include: { bookings: true },
  });
  res.json(
    new HTTPSuccessResponse(
      "Restaurants fetched successfully",
      200,
      restaurants
    )
  );
};

// // Search Restaurants by Cuisine, Location, Price Range, and Availability
export const searchRestaurants = async (req: Request, res: Response) => {
  const { name, location, ratings, cuisine } = req.query;
  // Fetch restaurants with the constructed filters
  const restaurants = await prisma.restaurant.findMany({
    where: {
      ...(location && {
        location: {
          contains: location as string,
          mode: "insensitive",
        },
      }),
      ...(cuisine && {
        cuisine: {
          contains: cuisine as string,
          mode: "insensitive",
        },
      }),
      ...(ratings && {
        ratings: +ratings,
      }),
      ...(name && {
        name: {
          contains: name as string,
          mode: "insensitive",
        },
      }),
    },
    include: {
      bookings: true, // Include bookings
    },
  });

  // Send success response
  const response = new HTTPSuccessResponse(
    "Restaurants fetched successfully",
    200,
    restaurants
  );
  return res.status(response.statusCode).json(response);
};

// // Get Detailed Restaurant Information
export const getRestaurantDetails = async (req: Request, res: Response) => {
  const restaurantId = +req.params.id;
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    include: {
      bookings: true,
    },
  });

  if (!restaurant) {
    throw new NotFoundException(
      "Restaurant not found",
      ErrorCode.RESTAURANT_NOT_FOUND
    );
  }

  const response = new HTTPSuccessResponse(
    "Restaurant details fetched successfully",
    200,
    restaurant
  );
  res.status(response.statusCode).json(response);
};

// Check table availability for a restaurant
export const checkTableAvailability = async (
  req: Request,
  res: Response
): Promise<Response> => {
  // Extract query parameters
  const { restaurantId, date, partySize } = req.query as {
    restaurantId: string;
    date: string;
    timeSlot: string;
    partySize?: string; // Optional
  };
  // Fetch restaurant details to get seating capacity
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: +restaurantId },
    select: { seats: true },
  });

  if (!restaurant) {
    return res.status(404).json({ error: "Restaurant not found" });
  }

  // Fetch confirmed bookings for the specified restaurant
  const availability = await prisma.booking.findMany({
    where: {
      restaurantId: +restaurantId,
      bookingDate: new Date(date),
      status: "CONFIRMED",
    },
  });

  // Calculate availability based on existing bookings and requested party size
  const totalBookedSeats = availability.reduce(
    (total, booking) => total + (booking.partySize ?? 0),
    0
  );

  const requestedPartySize = partySize ? Number(partySize) : 1;

  const isAvailable =
    totalBookedSeats + requestedPartySize <= restaurant.seats!;
  const availAbality = restaurant.seats! - totalBookedSeats;

  const response = new HTTPSuccessResponse(
    "Table availability checked successfully",
    200,
    { isAvailable, availAbality: availAbality }
  );

  return res.status(response.statusCode).json(response);
};

// Reserve a table at a restaurant
export const reserveTable = async (req: Request, res: Response) => {
  // Validate request data
  const validationResult = reservationSchema.safeParse(req.body);
  if (!validationResult.success) {
    return handleValidationError(res, validationResult);
  }

  const { userId, restaurantId, bookingDate, partySize, totalPrice } =
    validationResult.data;

  const booking = await prisma.$transaction(async (tx) => {
    // Fetch restaurant details to get seating capacity
    const restaurant = await tx.restaurant.findUnique({
      where: { id: restaurantId },
      select: { seats: true },
    });

    if (!restaurant) {
      throw new NotFoundException(
        "Restaurant not found",
        ErrorCode.RESTAURANT_NOT_FOUND
      );
    }

    const seatAvailable = restaurant.seats!;
    const seatBooked = await tx.booking.aggregate({
      where: {
        restaurantId,
        bookingDate: new Date(bookingDate),
        status: "CONFIRMED",
      },
      _sum: {
        partySize: true,
      },
    });

    const totalBookedSeats = seatBooked._sum.partySize ?? 0;
    const requestedPartySize = partySize ?? 1;
    const isAvailable = totalBookedSeats + requestedPartySize <= seatAvailable;

    if (!isAvailable) {
      throw new BadRequestException(
        "Not enough seats available",
        ErrorCode.NOT_ENOUGH_SEATS
      );
    }

    return tx.booking.create({
      data: {
        userId,
        restaurantId,
        bookingDate: new Date(bookingDate),
        partySize,
        totalPrice,
        status: "PENDING",
      },
    });
  });

  return res
    .status(201)
    .json(new HTTPSuccessResponse("Table reserved successfully", 201, booking));
};

// Update booking status
export const updateBookingStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  // Validate request data
  const validationResult = updateStatusSchema.safeParse({
    bookingId: id,
    status,
  });

  if (!validationResult.success) {
    return handleValidationError(res, validationResult);
  }

  const validStatus = validationResult.data.status as
    | "PENDING"
    | "CONFIRMED"
    | "CANCELLED"
    | "COMPLETED";

  const updatedBooking = await prisma.$transaction(async (tx) => {
    // Check if booking exists
    const existingBooking = await prisma.booking.findUnique({
      where: { id: +id },
    });

    if (!existingBooking) {
      return res.status(404).json({
        message: "Booking not found",
        errorCode: "BOOKING_NOT_FOUND",
      });
    }

    const restaurant = await tx.restaurant.findUnique({
      where: { id: existingBooking.restaurantId! },
      select: { seats: true },
    });

    if (!restaurant) {
      throw new NotFoundException(
        "Restaurant not found",
        ErrorCode.RESTAURANT_NOT_FOUND
      );
    }

    const seatAvailable = restaurant.seats!;
    const seatBooked = await tx.booking.aggregate({
      where: {
        restaurantId: existingBooking.restaurantId!,
        bookingDate: new Date(existingBooking.bookingDate),
        status: "CONFIRMED",
      },
      _sum: {
        partySize: true,
      },
    });

    const totalBookedSeats = seatBooked._sum.partySize ?? 0;
    const requestedPartySize = existingBooking.partySize ?? 1;
    const isAvailable = totalBookedSeats + requestedPartySize <= seatAvailable;

    if (!isAvailable) {
      throw new BadRequestException(
        "Not enough seats available",
        ErrorCode.NOT_ENOUGH_SEATS
      );
    }

    // Update booking status
    return tx.booking.update({
      where: { id: +id },
      data: { status: validStatus },
    });
  });

  // Send success response
  return res.status(200).json({
    message: "Booking status updated successfully",
    booking: updatedBooking,
  });
};
