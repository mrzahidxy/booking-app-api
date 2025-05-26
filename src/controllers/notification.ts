import { Request, Response } from "express";
import prisma from "../connect";
import { NotFoundException } from "../exceptions/not-found";
import { formatPaginationResponse } from "../utils/common-method";
import { ErrorCode } from "../exceptions/root";
import { HTTPSuccessResponse } from "../helpers/success-response";


export const getNotifications = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Fetch roles with pagination
    const [totalNotifications, notification] = await prisma.$transaction([
        prisma.notification.count(),
        prisma.notification.findMany({
            skip,
            take: limit,
            where:{userId: req.user?.id},
            orderBy: { createdAt: 'desc' },            // ← newest first
        }),
    ]);

    if (!notification) {
        throw new NotFoundException("No hotels found", ErrorCode.NOTIFICATION_NOT_FOUND);
    }

    const formattedResponse = formatPaginationResponse(notification, totalNotifications, page, limit);

    const response = new HTTPSuccessResponse(
        "Hotels fetched successfully",
        200,
        formattedResponse
    );
    return res.status(response.statusCode).json(response);
}

export const readNotification = async (req: Request, res: Response) => {

    await prisma.notification.update({
        where: { id: Number(req.params.id) },
        data: { read: true },
    });

    res.json(
        new HTTPSuccessResponse("Restaurant created successfully", 201)
    );
};

