import { Router } from "express";
import { stripeWebhook } from "../controllers/payment";
import { asyncHandler } from "../exceptions/async-handler";

const paymentWebhookRoutes = Router();

paymentWebhookRoutes.post("/", asyncHandler(stripeWebhook));

export default paymentWebhookRoutes;
