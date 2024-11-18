import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { UnauthorizedException } from "../exceptions/unauthorized";
import { ErrorCode } from "../exceptions/root";
import { JWT_SECRET } from "../secret";
import prisma from "../connect";
import { User } from "@prisma/client";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization;

  if (!token) {
    next(
      new UnauthorizedException(
        "No token provided",
        ErrorCode.NO_TOKEN_PROVIDED
      )
    );
  }

  try {
    const payload = jwt.verify(token!, JWT_SECRET);

    const user = await prisma.user.findFirst({
      where: { id: (payload as any).id },
    });

    if (!user) {
      next(
        new UnauthorizedException(
          "No token provided",
          ErrorCode.NO_TOKEN_PROVIDED
        )
      );
    } 

    req.user = user as User;
    next();
  } catch (error) {
    next(
      new UnauthorizedException(
        "No token provided",
        ErrorCode.NO_TOKEN_PROVIDED
      )
    );
  }
};
