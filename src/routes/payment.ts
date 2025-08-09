import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { createCheckoutSession } from "../controllers/payment";

export const paymentRoutes: Router = Router();

paymentRoutes.post('/:id', authMiddleware, createCheckoutSession)