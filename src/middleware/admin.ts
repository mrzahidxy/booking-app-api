import { NextFunction, Request, Response } from "express";
import { HTTPSuccessResponse } from "../helpers/success-response";

export const adminMiddleWare = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;
  // if (user?.role === "ADMIN") {
  //   next();
  // } else {
  //   const response = new HTTPSuccessResponse(
  //     "Unauthorized",
  //     401
  //   );
  //   res.status(response.statusCode).json(response);
  // }
};
