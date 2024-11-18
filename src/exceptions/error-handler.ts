import { InternalException } from "./internal-exception";
import { NextFunction, Request, Response } from "express";
import { ErrorCode, HTTPException } from "./root";

export const errorHandler = (method: Function) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await method(req, res, next);
    } catch (error) {
      let exception: HTTPException;
      if (error instanceof HTTPException) {
        exception = error;
      } else {
        exception = new InternalException(
          "Something went wrong",
          error,
          ErrorCode.INTERNAL_EXCEPTION
        );
      }
      next(exception);
    }
  };
};
