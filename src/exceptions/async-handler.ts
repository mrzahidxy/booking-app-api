import { InternalException } from "./internal-exception";
import { NextFunction, Request, RequestHandler, Response } from "express";
import { HTTPException } from "./root";

export const asyncHandler =
  (fn: RequestHandler): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      let exception: HTTPException;
      if (error instanceof HTTPException) {
        exception = error;
      } else {
        exception = new InternalException("Something went wrong", error, 500);
      }
      next(exception);
    });
  };
