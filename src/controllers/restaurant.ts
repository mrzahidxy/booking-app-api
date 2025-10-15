import { Request, Response } from "express";
import prisma from "../connect";
import { HTTPSuccessResponse } from "../helpers/success-response";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";
import { reservationSchema, bookingStatusSchema } from "../schema/booking";
import { BadRequestException } from "../exceptions/bad-request";
import {
  formatPaginationResponse,
  handleValidationError,
} from "../utils/common-method";
import { restaurantSchema } from "../schema/restaurant";
import { Prisma } from "@prisma/client";


export const createRestaurant = async (req: Request, res: Response) => {
  const validation = restaurantSchema.safeParse(req.body);
  if (!validation.success) return handleValidationError(res, validation);
  const { name, location, cuisine, seats, menu, image, description } = validation.data;

  const restaurant = await prisma.restaurant.create({
    data: { name, location, description, cuisine, image, seats, menu: JSON.stringify(menu) },
  });
  res.json(
    new HTTPSuccessResponse("Restaurant created successfully", 201, restaurant)
  );
};


export const updateRestaurant = async (req: Request, res: Response) => {
  const restaurantId = +req.params.id;
  const { name, location, cuisine, seats, menu, timeSlots } = req.body;
  // Check if an image file was uploaded
  const imageUrl = req.file ? req.file.path : null;

  // Build update data dynamically to only include provided fields
  const restaurantData: Record<string, any> = {};

  if (name) restaurantData.name = name;
  if (location) restaurantData.location = location;
  if (cuisine) restaurantData.cuisine = cuisine;
  if (seats) restaurantData.seats = +seats; 
  if (menu) restaurantData.menu = menu;
  if (imageUrl) restaurantData.image = imageUrl;
  if (timeSlots) restaurantData.timeSlots = timeSlots;

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

  const totalRestaurants = await prisma.restaurant.count();

  const formattedResponse = formatPaginationResponse(
    restaurants,
    totalRestaurants,
    +page,
    +limit
  );

  const response = new HTTPSuccessResponse(
    "Restaurants fetched successfully",
    200,
    formattedResponse
  );
  res.status(response.statusCode).json(response);
};

// // Search Restaurants by Cuisine, Location, Price Range, and Availability


export const searchRestaurants = async (req: Request, res: Response) => {
  // Validate and parse query parameters
  const { name, location, ratings, cuisine, page = 1, limit = 10 } = req.query;

  const pageNumber = parseInt(page as string, 10) || 1;
  const pageSize = parseInt(limit as string, 10) || 10;

  // Construct filter object based on query params
  const whereClause = {
    ...(location && {
      location: {
        contains: location as string,
        mode: Prisma.QueryMode.insensitive,
      },
    }),
    ...(ratings && {
      ratings: Number(ratings),
    }),
    ...(name && {
      name: {
        contains: name as string,
        mode:  Prisma.QueryMode.insensitive,
      },
    }),
    // Uncomment if/when cuisine is supported
    // ...(cuisine && {
    //   cuisine: {
    //     hasEvery: Array.isArray(cuisine) ? cuisine : [cuisine as string],
    //   },
    // }),
  };

  // Check if restaurants exist first before fetching count
  const restaurants = await prisma.restaurant.findMany({
    where: whereClause,
    skip: (pageNumber - 1) * pageSize,
    take: pageSize,
  });

  // If no restaurants found, return an error
  if (!restaurants) {
    throw new NotFoundException("Something went wrong", 404)
  }

  // Get total count for pagination
  const totalRestaurants = await prisma.restaurant.count({ where: whereClause });

  // Format and structure the response with pagination data
  const formattedResponse = formatPaginationResponse(restaurants ?? [], totalRestaurants, pageNumber, pageSize);

  // Send the response back
  const response = new HTTPSuccessResponse("Restaurants fetched successfully", 200, formattedResponse);
  return res.status(response.statusCode).json(response);
};



// Get Detailed Restaurant Information
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
  const { restaurantId, date, partySize, timeSlot } = req.query as {
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
      timeSlot: timeSlot
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

  console.log('totalBookedSeats', totalBookedSeats, 'requestedPartySize', requestedPartySize, 'seats', restaurant.seats);
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

  const { restaurantId, bookingDate, partySize, timeSlot } =
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
        timeSlot: {
          in: [timeSlot],
        },
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
        userId: req.user?.id as number,
        restaurantId,
        bookingDate: new Date(bookingDate),
        partySize,
        timeSlot,
        totalPrice: 100,
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
  const validationResult = bookingStatusSchema.safeParse({
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





