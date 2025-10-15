import { NextFunction, Request, Response } from "express";
import { compareSync, hashSync } from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../connect";
import { BadRequestException } from "../exceptions/bad-request";
import { ErrorCode } from "../exceptions/root";
import { SignUpSchema } from "../schema/users";
import { NotFoundException } from "../exceptions/not-found";
import { JWT_SECRET } from "../secret";
import { HTTPSuccessResponse } from "../helpers/success-response";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  SignUpSchema.parse(req.body);
  const { email, password, name } = req.body;

  let user = await prisma.user.findFirst({
    where: { email },
  });

  if (user) {
    next(
      new BadRequestException(
        "User already exists",
        ErrorCode.USER_ALREADY_EXISTS
      )
    );
  }

  let userRoleId = await prisma.role.findUnique({
    where: { name: "User" },
  });

  user = await prisma.user.create({
    data: {
      email,
      password: hashSync(password, 10),
      name,
      roleId: userRoleId?.id,
    },
  });

  const { password: userPassword, ...rest } = user;

  const response = new HTTPSuccessResponse("Signup successfully", 201, rest);
  res.status(response.statusCode).json(response);
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  let user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      password: true,
      role: {
        select: {
          name: true,
        },
      },
    },
  });
  

  if (!user) {
    return next(
      new NotFoundException("No user found", ErrorCode.USER_NOT_FOUND)
    );
  }

  if (!compareSync(password, user.password)) {
    return next(
      new BadRequestException("Wrong password", ErrorCode.INCORRECT_PASSWORD)
    );
  }

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1d" });

  const { password: userPassword, role,  ...rest } = user;

  const response = new HTTPSuccessResponse("Login successfully", 201, {
    ...rest,
    role: role?.name,
    token,
  });
  res.status(response.statusCode).json(response);
};

