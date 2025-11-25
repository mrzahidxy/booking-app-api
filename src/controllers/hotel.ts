
import { Request, Response } from "express";
import { hotelSchema } from "../schemas/hotels";
import { handleValidationError } from "../utils/common-method";
import {
  checkRoomAvailabilityService,
  fetchHotelDetails,
  fetchHotels,
  removeHotel,
  searchHotels as searchHotelsService,
  upsertHotel,
} from "../services/hotel.service";




export const CreateUpdateHotel = async (req: Request, res: Response) => {
  // ✅ Validate hotel data
  const validation = hotelSchema.safeParse(req.body);
  if (!validation.success) return handleValidationError(res, validation);

  const { name, location, description, amenities, image, rooms } = validation.data;
  const hotelId = req.params.id ? +req.params.id : null;

  const response = await upsertHotel({
    hotelId,
    data: { name, location, description, amenities, image, rooms },
  });

  return res.status(response.statusCode).json(response);
};


// Delete a Hotel
export const deleteHotel = async (req: Request, res: Response) => {
  const hotelId = +req.params.id;

  const response = await removeHotel(hotelId);
  return res.status(response.statusCode).json(response);
}

// Get All Hotels
export const getHotels = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const response = await fetchHotels({ page, limit });
  return res.status(response.statusCode).json(response);
}

// Get Detailed Hotel Information including Rooms
export const getHotelDetails = async (req: Request, res: Response) => {
  const hotelId = +req.params.id;

  const response = await fetchHotelDetails(hotelId);
  res.status(response.statusCode).json(response);
};


// Search Hotels by Location, Room Type, and Price Range
export const searchHotels = async (req: Request, res: Response) => {

  const { location, minPrice, maxPrice, roomType, name } = req.query;

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const response = await searchHotelsService({
    location: location as string | undefined,
    minPrice: minPrice as string | undefined,
    maxPrice: maxPrice as string | undefined,
    roomType: roomType as string | undefined,
    name: name as string | undefined,
    page,
    limit,
  });

  res.status(response.statusCode).json(response);
};

export const checkRoomAvailability = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { roomId, date, quantity } = req.query as {
    roomId: string;
    date: string;
    quantity: string
  };

  const response = await checkRoomAvailabilityService({
    roomId: roomId ? +roomId : undefined,
    date,
    quantity: quantity ? +quantity : undefined,
  });

  return res.status(response.statusCode).json(response);
};
