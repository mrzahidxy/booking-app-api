import { authMiddleware } from './../middleware/auth';
import { Router } from "express";
import { asyncHandler } from "../exceptions/async-handler";
import { getNotifications, readNotification } from "../controllers/notification";

const notificationRoutes: Router = Router();

notificationRoutes.get("/", authMiddleware, asyncHandler(getNotifications));
notificationRoutes.patch("/:id/read", authMiddleware, asyncHandler(readNotification));

export default notificationRoutes;
