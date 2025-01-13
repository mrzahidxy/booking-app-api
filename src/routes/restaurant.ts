import { Router } from "express";
import { asyncHandler } from "../exceptions/async-handler";
import {
  checkTableAvailability,
  createRestaurant,
  getAllRestaurants,
  getRestaurantDetails,
  reserveTable,
  searchRestaurants,
  updateBookingStatus,
  updateRestaurant,
} from "../controllers/restaurant";
import { authMiddleware } from "../middleware/auth";
import multer from "multer";
import { storage } from "../config/cloudinary";
import { adminMiddleWare } from "../middleware/admin";
import checkPermission from "../middleware/check-permission";

const upload = multer({ storage: storage });
const restaurantRoutes: Router = Router();

restaurantRoutes.get("/", asyncHandler(getAllRestaurants));
restaurantRoutes.get("/search", asyncHandler(searchRestaurants));
restaurantRoutes.get("/:id", asyncHandler(getRestaurantDetails));

restaurantRoutes.post(
  "/",
  authMiddleware,
  checkPermission("CREATE_RESTAURANT"),
  upload.single("image"),
  asyncHandler(createRestaurant)
);
restaurantRoutes.put(
  "/:id",
  authMiddleware,
  checkPermission("UPDATE_RESTAURANT"),
  upload.single("image"),
  asyncHandler(updateRestaurant)
);
restaurantRoutes.post(
  "/reservation",
  authMiddleware,
  asyncHandler(reserveTable)
);
restaurantRoutes.post(
  "/reservation/:id",
  authMiddleware,
  asyncHandler(updateBookingStatus)
);

restaurantRoutes.get(
  "/reservation/check",
  authMiddleware,
  asyncHandler(checkTableAvailability)
);

export default restaurantRoutes;
