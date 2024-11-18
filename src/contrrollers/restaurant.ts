import { Request, Response } from "express";
import prisma from "../connect";
import { HTTPSuccessResponse } from "../helpers/success-response";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";
import { InternalException } from "../exceptions/internal-exception";
import { reservationSchema, updateStatusSchema } from "../schema/booking";
import { BadRequestException } from "../exceptions/bad-request";

export const createRestaurant = async (req: Request, res: Response) => {
  const { name, location, cuisine, seats } = req.body;
  try {
    // Check if an image file was uploaded
    const imageUrl = req.file ? req.file.path : null;

    const restaurant = await prisma.restaurant.create({
      data: { name, location, cuisine, image: imageUrl, seats },
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
  const { name, location, cuisine, seats } = req.body;
  const seatsInt = Number(seats);
  console.log(seats);
  try {
    // Check if an image file was uploaded
    const imageUrl = req.file ? req.file.path : null;

    const restaurantData: {
      name?: string;
      location?: string;
      cuisine?: string;
      seats?: number;
      image?: string;
    } = {
      name,
      location,
      cuisine,
      seats: seatsInt,
    };

    // Only add `image` if `imageUrl` is provided
    if (imageUrl) {
      restaurantData.image = imageUrl;
    }

    const restaurant = await prisma.restaurant.update({
      where: { id: restaurantId },
      data: restaurantData,
    });

    res.json(
      new HTTPSuccessResponse(
        "Restaurant updated successfully",
        200,
        restaurant
      )
    );
  } catch (error) {
    console.log(error);
    throw new NotFoundException(
      "Restaurant not found",
      ErrorCode.RESTAURANT_NOT_FOUND
    );
  }
};

export const getAllRestaurants = async (req: Request, res: Response) => {
  try {
    const restaurants = await prisma.restaurant.findMany({
      include: { bookings: true },
    });
    res.json(
      new HTTPSuccessResponse(
        "Restaurants fetched successfully",
        200,
        restaurants
      )
    );
  } catch (error) {
    throw new InternalException(
      "Something went wrong",
      error,
      ErrorCode.INTERNAL_EXCEPTION
    );
  }
};

// // Search Restaurants by Cuisine, Location, Price Range, and Availability
export const searchRestaurants = async (req: Request, res: Response) => {
  const { name, location, ratings, cuisine } = req.query;

  try {
    // Prepare filters dynamically to avoid null or undefined values in query
    const filters: any = {};

    if (name) {
      filters.name = {
        contains: name as string,
        mode: "insensitive",
      };
    }

    if (location) {
      filters.location = {
        contains: location as string,
        mode: "insensitive",
      };
    }

    if (cuisine) {
      filters.cuisine = {
        contains: cuisine as string,
        mode: "insensitive",
      };
    }

    if (ratings) {
      filters.ratings = Number(ratings);
    }

    // Fetch restaurants with the constructed filters
    const restaurants = await prisma.restaurant.findMany({
      where: filters,
      include: {
        bookings: true, // Include bookings to check availability
      },
    });

    // Send success response
    const response = new HTTPSuccessResponse(
      "Restaurants fetched successfully",
      200,
      restaurants
    );
    return res.status(response.statusCode).json(response);
  } catch (error) {
    // Improved error handling with a detailed message
    const internalError = new InternalException(
      "Failed to fetch restaurants",
      error,
      ErrorCode.INTERNAL_EXCEPTION
    );
    return res.status(internalError.statusCode).json(internalError);
  }
};

// // Get Detailed Restaurant Information including Menu, Photos, and Reviews
export const getRestaurantDetails = async (req: Request, res: Response) => {
  const restaurantId = +req.params.id;

  try {
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
  } catch (error) {
    throw new InternalException(
      "Something went wrong",
      error,
      ErrorCode.INTERNAL_EXCEPTION
    );
  }
};

// Check table availability for a restaurant
export const checkTableAvailability = async (
  req: Request,
  res: Response
): Promise<Response> => {
  // Extract query parameters with type assertion
  const { restaurantId, date, timeSlot, partySize } = req.query as {
    restaurantId: string;
    date: string;
    timeSlot: string;
    partySize?: string; // Optional
  };

  try {
    // Fetch restaurant details to get seating capacity
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: Number(restaurantId) },
      select: { seats: true }, 
    });

    // Handle case where restaurant is not found
    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    // Fetch confirmed bookings for the specified restaurant, date, and time slot
    const availability = await prisma.booking.findMany({
      where: {
        restaurantId: Number(restaurantId), 
        bookingDate: new Date(date),
        status: "CONFIRMED",
        // timeSlot,
      },
    });

    // Calculate availability based on existing bookings and requested party size
    const totalBookedSeats = availability.reduce(
      (total, booking) => total + (booking.partySize ?? 0),
      0
    );

    const requestedPartySize = partySize ? Number(partySize) : 1; // Default to 1 if partySize is not provided
    const isAvailable =
      totalBookedSeats + requestedPartySize <= restaurant.seats!; // Assume restaurant.seats is accessible
    const availAbality = restaurant.seats! - totalBookedSeats;
    // Construct success response
    const response = new HTTPSuccessResponse(
      "Table availability checked successfully",
      200,
      { isAvailable, availAbality: availAbality }
    );

    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error("Availability Check Error:", error); // Log the error for debugging

    // Handle unexpected errors
    throw new InternalException(
      "Failed to check table availability",
      error,
      ErrorCode.INTERNAL_EXCEPTION
    );
  }
};

// Reserve a table at a restaurant
export const reserveTable = async (
  req: Request,
  res: Response
): Promise<Response> => {
  // Step 1: Validate incoming request body against reservation schema
  const validationResult = reservationSchema.safeParse(req.body);
  if (!validationResult.success) {
    return res.status(400).json({
      error: "Invalid data provided",
      details: validationResult.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      })),
    });
  }

  const { userId, restaurantId, bookingDate, timeSlot, partySize, totalPrice } =
    validationResult.data;

  try {
    // Step 2: Fetch restaurant to verify it exists and retrieve available seats
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { seats: true },
    });

    if (!restaurant) {
      throw new NotFoundException(
        "Restaurant not found",
        ErrorCode.RESTAURANT_NOT_FOUND
      );
    }

    // Step 3: Fetch confirmed bookings for the specified date and time slot
    const existingBookings = await prisma.booking.findMany({
      where: {
        restaurantId,
        bookingDate: new Date(bookingDate),
        timeSlot,
        status: "CONFIRMED",
      },
      select: { partySize: true },
    });

    // Step 4: Calculate remaining seats based on confirmed bookings
    const seatsBooked = existingBookings.reduce(
      (total, booking) => total + (booking.partySize ?? 0),
      0
    );
    const remainingSeats = Math.max((restaurant.seats ?? 0) - seatsBooked, 0);

    // Step 5: Check if there are enough seats for the requested party size
    if (remainingSeats < partySize) {
      throw new BadRequestException(
        "Not enough seats available",
        ErrorCode.NOT_ENOUGH_SEATS
      );
    }

    // Step 6: Create a new booking record with a pending status
    const booking = await prisma.booking.create({
      data: {
        userId,
        restaurantId,
        bookingDate: new Date(bookingDate),
        timeSlot,
        partySize,
        totalPrice,
        status: "PENDING",
      },
    });

    // Step 7: Send success response with booking details
    return res
      .status(201)
      .json(
        new HTTPSuccessResponse("Table reserved successfully", 201, booking)
      );
  } catch (error) {
    console.error("Reservation Error:", error);

    // Step 8: Handle known exceptions, or throw internal error for unexpected ones
    throw new InternalException(
      "Failed to reserve table",
      error,
      ErrorCode.INTERNAL_EXCEPTION
    );
  }
};

// Update booking status
export const updateBookingStatus = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const { status } = req.body;

  // Validate request data against the update status schema
  const validationResult = updateStatusSchema.safeParse({
    bookingId: id,
    status,
  });

  if (!validationResult.success) {
    return res.status(400).json({
      error: "Invalid data provided",
      details: validationResult.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      })),
    });
  }

  const validStatus = validationResult.data.status as
    | "PENDING"
    | "CONFIRMED"
    | "CANCELLED"
    | "COMPLETED";

  try {
    // Update booking status in database
    const updatedBooking = await prisma.booking.update({
      where: { id: Number(id) },
      data: { status: validStatus },
    });

    // Send success response
    return res.status(200).json({
      message: "Booking status updated successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Status Update Error:", error);
    throw new InternalException(
      "Failed to update booking status",
      error,
      ErrorCode.INTERNAL_EXCEPTION
    );
  }
};
