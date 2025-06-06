import { Router } from "express";
import { asyncHandler } from "../exceptions/async-handler";
import {
  checkRoomAvailability,
  CreateUpdateHotel,
  deleteHotel,
  getHotelDetails,
  getHotels,
  searchHotels,
} from "../controllers/hotel";
import { authMiddleware } from "../middleware/auth";
import checkPermission from "../middleware/check-permission";


export const hotelRoutes: Router = Router();

hotelRoutes.get("/", asyncHandler(getHotels));
hotelRoutes.get("/:id", asyncHandler(getHotelDetails));
hotelRoutes.get("/search/result",  asyncHandler(searchHotels));


hotelRoutes.post(
  "/",
  authMiddleware,
  asyncHandler(CreateUpdateHotel)
);

hotelRoutes.put(
  "/:id",
  authMiddleware,
  asyncHandler(CreateUpdateHotel)
);

hotelRoutes.delete("/:id", authMiddleware, asyncHandler(deleteHotel));

hotelRoutes.get("/booked", asyncHandler(checkRoomAvailability));

