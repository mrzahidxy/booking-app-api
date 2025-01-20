import { Request, Response } from "express";
import { HTTPSuccessResponse } from "../helpers/success-response";
import prisma from "../connect";
import { ErrorCode } from "../exceptions/root";
import { NotFoundException } from "../exceptions/not-found";

export const getReviews = async (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query;

  // Fetch all users from the database
  const reviews = await prisma.review.findMany({
    skip: (+page - 1) * +limit,
    take: +limit,
  });
  const total = await prisma.user.count();

  // Send success response
  const response = new HTTPSuccessResponse("Users fetched successfully", 200, {
    page: +page,
    limit: +limit,
    total,
    data: reviews,
  });
  res.status(response.statusCode).json(response);
};

export const createReview = async (req: Request, res: Response) => {
  const { userId, hotelId, restaurantId, rating, review } = req.body;

  // Ensure the review is associated with either a hotel or a restaurant
  if (!hotelId && !restaurantId) {
    return res.status(400).json({
      message: "Review must be associated with either a hotel or a restaurant.",
    });
  }

  // Create the review
  const newReview = await prisma.review.create({
    data: {
      userId,
      hotelId: hotelId || null,
      restaurantId: restaurantId || null,
      rating,
      review,
    },
  });

  res
    .status(201)
    .json(
      new HTTPSuccessResponse("Review created successfully", 201, newReview)
    );
};

export const updateReview = async (req: Request, res: Response) => {
  const reviewId = +req.params.id;
  const { rating, review } = req.body;

  // Find the existing review
  const existingReview = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!existingReview) {
    throw new NotFoundException("Review not found", ErrorCode.REVIEW_NOT_FOUND);
  }

  // Update the review
  const updatedReview = await prisma.review.update({
    where: { id: reviewId },
    data: { rating, review },
  });

  res
    .status(200)
    .json(
      new HTTPSuccessResponse("Review updated successfully", 200, updatedReview)
    );
};

export const deleteReview = async (req: Request, res: Response) => {
  const reviewId = +req.params.id;

  const existingReview = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!existingReview) {
    throw new NotFoundException("Review not found", ErrorCode.REVIEW_NOT_FOUND);
  }

  // Delete the review
  await prisma.review.delete({
    where: { id: reviewId },
  });

  res
    .status(200)
    .json(new HTTPSuccessResponse("Review deleted successfully", 200));
};
