import { Request, Response } from "express";
import prisma from "../connect";
import { HTTPSuccessResponse } from "../helpers/success-response"; import { NotFoundException } from "../exceptions/not-found";
import { formatPaginationResponse } from "../utils/common-method";
import { ErrorCode } from "../exceptions/root";
;


export const getUsers = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const users = await prisma.user.findMany({
    skip,
    take: limit,
  })

  const totalUsers = await prisma.user.count();

  if (!users || users.length === 0) {
    throw new NotFoundException("No users found", ErrorCode.USER_NOT_FOUND);
  }

  const formattedResponse = formatPaginationResponse(users, totalUsers, page, limit);

  return res.status(200).json(
    new HTTPSuccessResponse(
      "Users fetched successfully",
      200,
      formattedResponse
    )
  )
}



export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: {
      id: +id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      updateAt: true,
      bookings: true,
      review: true,
      notification: true,
    },

  });

  if (!user) {
    throw new NotFoundException("User not found", ErrorCode.USER_NOT_FOUND);
  }

  const response = new HTTPSuccessResponse(
    "User fetched successfully",
    200,
    user
  );

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


// save fcm token for user notification
export const saveFcmToken = async (req: Request, res: Response) => {
  const userId = Number(req.user?.id);
  const { fcmToken } = req.body;

  // ✅ Basic validation
  if (!userId || !fcmToken) {
    const error = new NotFoundException("User ID and FCM token are required", 400);
    return res.status(error.statusCode).json(error);
  }

  const saveFcmToken = await prisma.user.update({
    where: { id: userId },
    data: { fcmToken },
  });

  const response = new HTTPSuccessResponse("FCM token saved successfully", 200, saveFcmToken);
  return res.status(response.statusCode).json(response);
}

