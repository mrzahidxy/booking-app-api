import { HTTPException } from "../exceptions/root";
import { NextFunction, Request, Response } from "express";

export const errorMiddleware = (
  error: HTTPException,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(error.statusCode || 500).json({
    message: error.message,
    errorCode: error.errorCode,
    errors: error.errors,
  });
};
