import { ZodError } from "zod";
import { Response } from "express";

export const handleValidationError = (res: Response, validationResult: { success: boolean; error?: ZodError }) => {
  if (!validationResult.success) {
    return res.status(400).json({
      error: "Invalid data provided",
      details: validationResult.error?.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      })),
    });
  }
  return null;
};


export const formatPaginationResponse = (data: any[], totalItems: number, page: number, limit: number) => {
  const totalPages = Math.ceil(totalItems / limit);
  
  return {
    collection:data,
    pagination: {
      totalItems,
      totalPages,
      currentPage: page,
      pageSize: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};
