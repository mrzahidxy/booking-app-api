import { Router } from "express";
import { asyncHandler } from "../exceptions/async-handler";
import { createReview, deleteReview, getReviews, updateReview } from "../controllers/review";

const reviewRoutes: Router = Router();

reviewRoutes.get("/", asyncHandler(getReviews));
reviewRoutes.post("/", asyncHandler(createReview));
reviewRoutes.delete("/:id", asyncHandler(deleteReview));
reviewRoutes.put("/:id", asyncHandler(updateReview));


export default reviewRoutes;
