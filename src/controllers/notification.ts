import { Request, Response } from "express";
import { markNotificationRead, fetchNotifications } from "../services/notification.service";
import { HTTPSuccessResponse } from "../helpers/success-response";


export const getNotifications = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const response = await fetchNotifications({
        userId: req.user?.id,
        page,
        limit,
    });
    return res.status(response.statusCode).json(response);
}

export const readNotification = async (req: Request, res: Response) => {

    const response = await markNotificationRead(Number(req.params.id));

    res.json(response);
};
