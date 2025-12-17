import { NextFunction, Request, Response } from "express";
import { SignUpSchema } from "../schemas/users";
import { loginUser, signupUser } from "../services/auth.service";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  SignUpSchema.parse(req.body);
  const response = await signupUser(req.body);
  res.status(response.statusCode).json(response);
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const response = await loginUser(req.body);
  res.status(response.statusCode).json(response);
};
