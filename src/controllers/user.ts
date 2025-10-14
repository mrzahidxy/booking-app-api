import { Request, Response } from "express";
import prisma from "../connect";
import { HTTPSuccessResponse } from "../helpers/success-response"; import { NotFoundException } from "../exceptions/not-found";
import { formatPaginationResponse } from "../utils/common-method";
import { ErrorCode } from "../exceptions/root";
;

/**
 * @openapi
 * /users:
 *   get:
 *     summary: Get all users with pagination
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Users fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: integer
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                           phone:
 *                             type: string
 *                           role:
 *                             type: string
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       404:
 *         description: No users found
 */
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

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: integer
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     role:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                     updateAt:
 *                       type: string
 *       404:
 *         description: User not found
 */
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

/**
 * @openapi
 * /users/{id}:
 *   put:
 *     summary: Update a user by ID
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: integer
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     role:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       404:
 *         description: User not found
 */
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

/**
 * @openapi
 * /users/fcm:
 *   put:
 *     summary: Save FCM token for user notifications
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fcmToken:
 *                 type: string
 *             required:
 *               - fcmToken
 *     responses:
 *       200:
 *         description: FCM token saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: integer
 *                 data:
 *                   type: object
 *       400:
 *         description: User ID and FCM token are required
 */
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