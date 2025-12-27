import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { asyncHandler } from "../exceptions/async-handler";
import checkPermission from "../middleware/check-permission";
import { getAdminDashboardStats } from "../controllers/admin";

const adminRoutes: Router = Router();

adminRoutes.get(
  "/stats",
  authMiddleware,
  checkPermission("GET_USER"),
  asyncHandler(getAdminDashboardStats)
);

export default adminRoutes;
