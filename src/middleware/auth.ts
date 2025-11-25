import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { UnauthorizedException } from "../exceptions/unauthorized";
import { ErrorCode } from "../exceptions/root";
import env from "../utils/env";
import prisma from "../utils/prisma";
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
    const payload = jwt.verify(token!, env.JWT_SECRET);

    const user = await prisma.user.findFirst({
      where: { id: (payload as any).id },
      include: {
        role: {
          select: {
            name: true,
          },
        },
      },
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
