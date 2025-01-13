import { Router } from "express";
import { asyncHandler } from "../exceptions/async-handler";
import multer from "multer";
import { storage } from "../config/cloudinary";
import { adminMiddleWare } from "../middleware/admin";
import {
  bookRoom,
  createHotel,
  getHotelDetails,
  getHotels,
  saveRoom,
  searchHotels,
  updateHotel,
} from "../controllers/hotel";
import { authMiddleware } from "../middleware/auth";
import checkPermission from "../middleware/check-permission";


export const hotelRoutes: Router = Router();

const upload = multer({ storage: storage });

hotelRoutes.post(
  "/",
  authMiddleware,
  upload.single("image"),
  asyncHandler(createHotel)
);

hotelRoutes.put(
  "/:id",
  authMiddleware,
  adminMiddleWare,
  upload.single("image"),
  asyncHandler(updateHotel)
);

hotelRoutes.get("/", asyncHandler(getHotels));
hotelRoutes.get("/:id", asyncHandler(getHotelDetails));
hotelRoutes.get("/search/result", searchHotels);
hotelRoutes.post("/book-room", authMiddleware, bookRoom);


hotelRoutes.post(
  "/:id/rooms",
  authMiddleware,
  upload.single("image"),
  asyncHandler(saveRoom)
);
