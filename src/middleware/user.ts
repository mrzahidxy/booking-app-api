import { NextFunction, Request, Response } from "express";

export const userMiddleWare = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;
  if (user?.role?.name?.toLowerCase() === "admin") {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};
