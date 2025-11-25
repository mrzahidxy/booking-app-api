import { Request, Response } from "express";
import {
  createReviewService,
  deleteReviewService,
  getReviewsService,
  updateReviewService,
} from "../services/review.service";

export const getReviews = async (req: Request, res: Response) => {
  const { page = 1, limit = 10, hotelId, restaurantId } = req.query;

  const response = await getReviewsService({
    page: Number(page),
    limit: Number(limit),
    hotelId: hotelId ? Number(hotelId) : undefined,
    restaurantId: restaurantId ? Number(restaurantId) : undefined,
  });
  res.status(response.statusCode).json(response);
};

export const createReview = async (req: Request, res: Response) => {
  const { userId, hotelId, restaurantId, rating, review } = req.body;

  if (!hotelId && !restaurantId) {
    return res.status(400).json({
      message: "Review must be associated with either a hotel or a restaurant.",
    });
  }

  const response = await createReviewService({
    userId,
    hotelId,
    restaurantId,
    rating,
    review,
  });

  res.status(response.statusCode).json(response);
};

export const updateReview = async (req: Request, res: Response) => {
  const reviewId = +req.params.id;
  const { rating, review } = req.body;

  const response = await updateReviewService({
    reviewId,
    rating,
    review,
  });

  res.status(response.statusCode).json(response);
};

export const deleteReview = async (req: Request, res: Response) => {
  const reviewId = +req.params.id;

  const response = await deleteReviewService(reviewId);

  res.status(response.statusCode).json(response);
};
