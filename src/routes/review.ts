import { Router } from "express";
import { asyncHandler } from "../exceptions/async-handler";
import { createReview } from "../controllers/review";

const reviewRoutes: Router = Router();

reviewRoutes.get("/", asyncHandler(createReview));
reviewRoutes.post("/", asyncHandler(createReview));
reviewRoutes.delete("/:id", asyncHandler(createReview));
reviewRoutes.put("/:id", asyncHandler(createReview));


export default reviewRoutes;
