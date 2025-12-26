import { Request, Response } from "express";
import { getAdminDashboardStatsService } from "../services/admin.service";

export const getAdminDashboardStats = async (req: Request, res: Response) => {
  const response = await getAdminDashboardStatsService();
  return res.status(response.statusCode).json(response);
};
