import { Request, Response } from "express";
import { reservationSchema } from "../schemas/booking";
import { handleValidationError } from "../utils/common-method";
import { restaurantSchema } from "../schemas/restaurant";
import {
  checkTableAvailabilityService,
  createRestaurantService,
  fetchRestaurantDetailsService,
  fetchRestaurantsService,
  reserveTableService,
  searchRestaurantsService,
  updateRestaurantService,
} from "../services/restaurant.service";


export const createRestaurant = async (req: Request, res: Response) => {
  const validation = restaurantSchema.safeParse(req.body);
  if (!validation.success) return handleValidationError(res, validation);
  const { name, location, cuisine, seats, menu, image, description } = validation.data;

  const response = await createRestaurantService({
    name,
    location,
    cuisine,
    seats,
    menu,
    image,
    description,
  });
  res.json(response);
};

export const updateRestaurant = async (req: Request, res: Response) => {
  const restaurantId = +req.params.id;
  const { name, location, cuisine, seats, menu, timeSlots, description, image } = req.body;

  const response = await updateRestaurantService({
    restaurantId,
    payload: {
      name,
      location,
      cuisine,
      seats: seats ? +seats : undefined,
      menu,
      description,
      image,
      timeSlots,
    },
  });

  res.json(response);
};

export const getAllRestaurants = async (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query;

  const response = await fetchRestaurantsService({
    page: +page,
    limit: +limit,
  });
  res.status(response.statusCode).json(response);
};

// // Search Restaurants by Cuisine, Location, Price Range, and Availability

export const searchRestaurants = async (req: Request, res: Response) => {
  // Validate and parse query parameters
  const { name, location, ratings, cuisine, page = 1, limit = 10 } = req.query;

  const response = await searchRestaurantsService({
    name: name as string | undefined,
    location: location as string | undefined,
    ratings: ratings as string | undefined,
    cuisine: cuisine as string | undefined,
    page: parseInt(page as string, 10),
    limit: parseInt(limit as string, 10),
  });
  return res.status(response.statusCode).json(response);
};


// // Get Detailed Restaurant Information
export const getRestaurantDetails = async (req: Request, res: Response) => {
  const restaurantId = +req.params.id;

  const response = await fetchRestaurantDetailsService(restaurantId);
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

  const response = await checkTableAvailabilityService({
    restaurantId: restaurantId ? +restaurantId : undefined,
    date,
    partySize: partySize ? Number(partySize) : undefined,
    timeSlot,
  });

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

  const response = await reserveTableService({
    userId: req.user?.id,
    restaurantId,
    bookingDate: new Date(bookingDate),
    partySize,
    timeSlot,
  });

  return res.status(response.statusCode).json(response);
};
