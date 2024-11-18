import { Router } from "express";
import { errorHandler } from "../exceptions/error-handler";
import multer from "multer";
import { storage } from "../config/cloudinary";
import { adminMiddleWare } from "../middleware/admin";
import { bookRoom, createHotel, createRoom, getHotelDetails, getHotels, searchHotels, updateHotel } from "../contrrollers/hotel";
import { authMiddleware } from "../middleware/auth";

export const hotelRoutes: Router = Router();

const upload = multer({ storage: storage });

hotelRoutes.post(
  "/",
  authMiddleware,
  adminMiddleWare,
  upload.single("image"),
  errorHandler(createHotel)
);
hotelRoutes.put(
  "/:id",
  authMiddleware,
  adminMiddleWare,
  upload.single("image"),
  errorHandler(updateHotel)
);

hotelRoutes.get("/", errorHandler(getHotels))
hotelRoutes.get("/:id", errorHandler(getHotelDetails))
hotelRoutes.post('/:id/rooms', authMiddleware, adminMiddleWare, upload.single('image'), errorHandler(createRoom))
hotelRoutes.get("/search/result", searchHotels)
hotelRoutes.post('/book-room',authMiddleware, bookRoom)

