import { Router } from "express";
import { asyncHandler } from "../exceptions/async-handler";
import { getNotifications, readNotification } from "../controllers/notification";

const notificationRoutes: Router = Router();

notificationRoutes.get("/", asyncHandler(getNotifications));
notificationRoutes.patch("/:id/read", asyncHandler(readNotification));

export default notificationRoutes;
