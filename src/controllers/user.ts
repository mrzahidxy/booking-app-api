import { Request, Response } from "express";
import prisma from "../connect";
import { HTTPSuccessResponse } from "../helpers/success-response";;

export const getUsers = async (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query;

  // Fetch all users from the database
  const users = await prisma.user.findMany({
    skip: (+page - 1) * +limit,
    take: +limit,
  });
  const totalUsers = await prisma.user.count();

  // Send success response
  const response = new HTTPSuccessResponse("Users fetched successfully", 200, {
    page: +page,
    limit: +limit,
    totalUsers,
    collection: users,
  });
  res.status(response.statusCode).json(response);
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await prisma.user.update({
    where: {
      id: +id,
    },
    data: req.body,
  });

  const response = new HTTPSuccessResponse(
    "User updated successfully",
    200,
    user
  );

  res.status(response.statusCode).json(response);
};
