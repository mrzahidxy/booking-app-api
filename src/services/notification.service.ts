import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";
import { HTTPSuccessResponse } from "../helpers/success-response";
import { formatPaginationResponse } from "../utils/common-method";
import prisma from "../utils/prisma";

export const fetchNotifications = async (params: {
  userId?: number;
  page?: number;
  limit?: number;
}) => {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const skip = (page - 1) * limit;

  const [totalNotifications, notification] = await prisma.$transaction([
    prisma.notification.count(),
    prisma.notification.findMany({
      skip,
      take: limit,
      where: { userId: params.userId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!notification) {
    throw new NotFoundException("No hotels found", ErrorCode.NOTIFICATION_NOT_FOUND);
  }

  const formattedResponse = formatPaginationResponse(notification, totalNotifications, page, limit);

  return new HTTPSuccessResponse("Notifications fetched successfully", 200, formattedResponse);
};

export const markNotificationRead = async (notificationId: number) => {
  await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });

  return new HTTPSuccessResponse("Restaurant created successfully", 201);
};
