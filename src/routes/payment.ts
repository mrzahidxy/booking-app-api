import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { createCheckoutSession } from "../controllers/payment";
import { asyncHandler } from "../exceptions/async-handler";

export const paymentRoutes: Router = Router();

paymentRoutes.post('/:id', authMiddleware, asyncHandler(createCheckoutSession))
