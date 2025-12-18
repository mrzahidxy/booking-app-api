import { Router } from "express";
import { asyncHandler } from "../exceptions/async-handler";
import {
  createRestaurant,
  getAllRestaurants,
  getRestaurantDetails,
  searchRestaurants,
  updateRestaurant,
} from "../controllers/restaurant";
import { authMiddleware } from "../middleware/auth";
import checkPermission from "../middleware/check-permission";

const restaurantRoutes: Router = Router();

restaurantRoutes.get("/", asyncHandler(getAllRestaurants));
restaurantRoutes.get("/search/result", asyncHandler(searchRestaurants));
restaurantRoutes.get("/:id", asyncHandler(getRestaurantDetails));

restaurantRoutes.post(
  "/",
  authMiddleware,
  checkPermission("MANAGE_RESTAURANT"),
  asyncHandler(createRestaurant)
);
restaurantRoutes.put(
  "/:id",
  authMiddleware,
  checkPermission("MANAGE_RESTAURANT"),
  asyncHandler(updateRestaurant)
);

export default restaurantRoutes;
