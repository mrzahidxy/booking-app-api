import { Request, Response } from "express";
import { HTTPSuccessResponse } from "../helpers/success-response";
import prisma from "../connect";
import { ErrorCode } from "../exceptions/root";
import { NotFoundException } from "../exceptions/not-found";

export const getReviews = async (req: Request, res: Response) => {
  const { page = 1, limit = 10, hotelId, restaurantId } = req.query;

  // Parse pagination parameters
  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 10;

  // Build the `where` clause dynamically
  const whereClause: Record<string, any> = {};
  if (hotelId) whereClause.hotelId = Number(hotelId);
  if (restaurantId) whereClause.restaurantId = Number(restaurantId);

  console.log("whereClause", whereClause);

  // Fetch reviews from the database
  const reviews = await prisma.review.findMany({
    skip: (pageNum - 1) * limitNum,
    take: limitNum,
    where: whereClause,
    include: {
      user: true,
    }
  });

  // Count total reviews
  const total = await prisma.review.count({
    where: whereClause,
  });

  // Send success response
  const response = new HTTPSuccessResponse("Reviews fetched successfully", 200, {
    page: pageNum,
    limit: limitNum,
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
