import { Prisma } from "@prisma/client";
import { BadRequestException } from "../exceptions/bad-request";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";
import { HTTPSuccessResponse } from "../helpers/success-response";
import { formatPaginationResponse } from "../utils/common-method";
import prisma from "../utils/prisma";

export const createRestaurantService = async (payload: {
  name: string;
  location: string;
  cuisine?: string[];
  seats?: number | null;
  menu?: unknown;
  image?: string[];
  description?: string | null;
}) => {
  const { name, location, cuisine, seats, menu, image, description } = payload;

  const restaurant = await prisma.restaurant.create({
    data: {
      name,
      location,
      description,
      cuisine: cuisine ?? [],
      image: image ?? [],
      seats,
      menu: JSON.stringify(menu),
    },
  });

  return new HTTPSuccessResponse("Restaurant created successfully", 201, restaurant);
};

export const updateRestaurantService = async (params: {
  restaurantId: number;
  payload: {
    name?: string;
    location?: string;
    cuisine?: string[];
    seats?: number;
    menu?: unknown;
    image?: string[];
    description?: string | null;
    timeSlots?: unknown;
  };
}) => {
  const { restaurantId, payload } = params;

  const restaurantData: Record<string, any> = {};

  if (payload.name) restaurantData.name = payload.name;
  if (payload.location) restaurantData.location = payload.location;
  if (payload.cuisine) restaurantData.cuisine = payload.cuisine;
  if (payload.seats) restaurantData.seats = payload.seats;
  if (payload.menu) restaurantData.menu = JSON.stringify(payload.menu);
  if (payload.image) restaurantData.image = payload.image;
  if (payload.description) restaurantData.description = payload.description;
  if (payload.timeSlots) restaurantData.timeSlots = payload.timeSlots;

  const restaurant = await prisma.restaurant.update({
    where: { id: restaurantId },
    data: restaurantData,
  });

  return new HTTPSuccessResponse("Restaurant updated successfully", 200, restaurant);
};

export const fetchRestaurantsService = async (params: { page?: number; limit?: number }) => {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;

  const restaurants = await prisma.restaurant.findMany({
    skip: (page - 1) * limit,
    take: limit,
    include: { bookings: true },
  });

  const totalRestaurants = await prisma.restaurant.count();

  const formattedResponse = formatPaginationResponse(restaurants, totalRestaurants, page, limit);

  return new HTTPSuccessResponse("Restaurants fetched successfully", 200, formattedResponse);
};

export const searchRestaurantsService = async (params: {
  name?: string;
  location?: string;
  ratings?: string;
  cuisine?: string;
  page?: number;
  limit?: number;
}) => {
  const pageNumber = params.page ?? 1;
  const pageSize = params.limit ?? 10;

  const whereClause = {
    ...(params.location && {
      location: {
        contains: params.location,
        mode: Prisma.QueryMode.insensitive,
      },
    }),
    ...(params.ratings && {
      ratings: Number(params.ratings),
    }),
    ...(params.name && {
      name: {
        contains: params.name,
        mode: Prisma.QueryMode.insensitive,
      },
    }),
  };

  const restaurants = await prisma.restaurant.findMany({
    where: whereClause,
    skip: (pageNumber - 1) * pageSize,
    take: pageSize,
  });

  if (!restaurants) {
    throw new NotFoundException("Something went wrong", 404);
  }

  const totalRestaurants = await prisma.restaurant.count({ where: whereClause });

  const formattedResponse = formatPaginationResponse(restaurants ?? [], totalRestaurants, pageNumber, pageSize);

  return new HTTPSuccessResponse("Restaurants fetched successfully", 200, formattedResponse);
};

export const fetchRestaurantDetailsService = async (restaurantId: number) => {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    include: {
      bookings: true,
    },
  });

  if (!restaurant) {
    throw new NotFoundException("Restaurant not found", ErrorCode.RESTAURANT_NOT_FOUND);
  }

  return new HTTPSuccessResponse("Restaurant details fetched successfully", 200, restaurant);
};

export const checkTableAvailabilityService = async (params: {
  restaurantId?: number;
  date?: string;
  partySize?: number;
  timeSlot?: string;
}) => {
  const { restaurantId, date, partySize, timeSlot } = params;

  if (!restaurantId || !date || !timeSlot) {
    throw new BadRequestException("Missing required parameters", ErrorCode.BAD_REQUEST);
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { seats: true },
  });

  if (!restaurant) {
    throw new NotFoundException("Restaurant not found", ErrorCode.RESTAURANT_NOT_FOUND);
  }

  const availability = await prisma.booking.findMany({
    where: {
      restaurantId,
      bookingDate: new Date(date),
      status: "CONFIRMED",
      timeSlot,
    },
  });

  const totalBookedSeats = availability.reduce(
    (total, booking) => total + (booking.partySize ?? 0),
    0
  );

  const requestedPartySize = partySize ?? 1;

  const isAvailable = totalBookedSeats + requestedPartySize <= restaurant.seats!;
  const availAbality = restaurant.seats! - totalBookedSeats;

  return new HTTPSuccessResponse("Table availability checked successfully", 200, {
    isAvailable,
    availAbality,
  });
};

export const reserveTableService = async (params: {
  userId?: number;
  restaurantId: number;
  bookingDate: Date;
  partySize?: number | null;
  timeSlot: string;
}) => {
  const { userId, restaurantId, bookingDate, partySize, timeSlot } = params;

  const booking = await prisma.$transaction(async (tx) => {
    const restaurant = await tx.restaurant.findUnique({
      where: { id: restaurantId },
      select: { seats: true },
    });

    if (!restaurant) {
      throw new NotFoundException("Restaurant not found", ErrorCode.RESTAURANT_NOT_FOUND);
    }

    const seatAvailable = restaurant.seats!;
    const seatBooked = await tx.booking.aggregate({
      where: {
        restaurantId,
        bookingDate,
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
        userId: userId as number,
        restaurantId,
        bookingDate,
        partySize,
        timeSlot,
        totalPrice: 100,
        status: "PENDING",
      },
    });
  });

  return new HTTPSuccessResponse("Table reserved successfully", 201, booking);
};

// Booking status updates are handled by the unified booking service.
