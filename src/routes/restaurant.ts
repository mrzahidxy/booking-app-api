import { Router } from "express";
import { errorHandler } from "../exceptions/error-handler";
import {
  checkTableAvailability,
  createRestaurant,
  getAllRestaurants,
  getRestaurantDetails,
  reserveTable,
  searchRestaurants,
  updateBookingStatus,
  updateRestaurant,
} from "../contrrollers/restaurant";
import { authMiddleware } from "../middleware/auth";
import multer from "multer";
import { storage } from "../config/cloudinary";
import { adminMiddleWare } from "../middleware/admin";

const upload = multer({ storage: storage });
const restaurantRoutes: Router = Router();

restaurantRoutes.get("/", errorHandler(getAllRestaurants));
restaurantRoutes.get("/search", errorHandler(searchRestaurants));
restaurantRoutes.get("/:id", errorHandler(getRestaurantDetails));
restaurantRoutes.post(
  "/",
  authMiddleware,
  adminMiddleWare,
  upload.single("image"),
  errorHandler(createRestaurant)
);
restaurantRoutes.put(
  "/:id",
  authMiddleware,
  adminMiddleWare,
  upload.single("image"),
  errorHandler(updateRestaurant)
);
restaurantRoutes.post(
  "/reservation",
  authMiddleware,
  errorHandler(reserveTable)
);
restaurantRoutes.post(
  "/reservation/:id",
  authMiddleware,
  errorHandler(updateBookingStatus)
);

restaurantRoutes.get(
  "/reservation/check",
  authMiddleware,
  errorHandler(checkTableAvailability)
);

export default restaurantRoutes;
