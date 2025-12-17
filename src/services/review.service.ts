import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";
import { HTTPSuccessResponse } from "../helpers/success-response";
import prisma from "../utils/prisma";

export const getReviewsService = async (params: {
  page?: number;
  limit?: number;
  hotelId?: number;
  restaurantId?: number;
}) => {
  const pageNum = params.page ?? 1;
  const limitNum = params.limit ?? 10;

  const whereClause: Record<string, any> = {};
  if (params.hotelId) whereClause.hotelId = params.hotelId;
  if (params.restaurantId) whereClause.restaurantId = params.restaurantId;

  const reviews = await prisma.review.findMany({
    skip: (pageNum - 1) * limitNum,
    take: limitNum,
    where: whereClause,
    include: {
      user: true,
    },
  });

  const total = await prisma.review.count({
    where: whereClause,
  });

  return new HTTPSuccessResponse("Reviews fetched successfully", 200, {
    page: pageNum,
    limit: limitNum,
    total,
    data: reviews,
  });
};

export const createReviewService = async (payload: {
  userId: number;
  hotelId?: number | null;
  restaurantId?: number | null;
  rating: number;
  review: string;
}) => {
  const { userId, hotelId, restaurantId, rating, review } = payload;

  const newReview = await prisma.review.create({
    data: {
      userId,
      hotelId: hotelId || null,
      restaurantId: restaurantId || null,
      rating,
      review,
    },
  });

  return new HTTPSuccessResponse("Review created successfully", 201, newReview);
};

export const updateReviewService = async (payload: {
  reviewId: number;
  rating?: number;
  review?: string;
}) => {
  const existingReview = await prisma.review.findUnique({
    where: { id: payload.reviewId },
  });

  if (!existingReview) {
    throw new NotFoundException("Review not found", ErrorCode.REVIEW_NOT_FOUND);
  }

  const updatedReview = await prisma.review.update({
    where: { id: payload.reviewId },
    data: { rating: payload.rating, review: payload.review },
  });

  return new HTTPSuccessResponse("Review updated successfully", 200, updatedReview);
};

export const deleteReviewService = async (reviewId: number) => {
  const existingReview = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!existingReview) {
    throw new NotFoundException("Review not found", ErrorCode.REVIEW_NOT_FOUND);
  }

  await prisma.review.delete({
    where: { id: reviewId },
  });

  return new HTTPSuccessResponse("Review deleted successfully", 200);
};
