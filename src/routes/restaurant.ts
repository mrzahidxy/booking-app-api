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
import { uploadMiddleware } from "../middleware/upload.middleware";
import checkPermission from "../middleware/check-permission";

const restaurantRoutes: Router = Router();

restaurantRoutes.get("/", asyncHandler(getAllRestaurants));
restaurantRoutes.get("/search/result", asyncHandler(searchRestaurants));
restaurantRoutes.get("/:id", asyncHandler(getRestaurantDetails));

restaurantRoutes.post(
  "/",
  authMiddleware,
  // checkPermission("CREATE_RESTAURANT"),
  // upload.single("image"),
  asyncHandler(createRestaurant)
);
restaurantRoutes.put(
  "/:id",
  authMiddleware,
  // checkPermission("UPDATE_RESTAURANT"),
  uploadMiddleware.single("image"),
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
  // authMiddleware,
  asyncHandler(checkTableAvailability)
);

export default restaurantRoutes;
