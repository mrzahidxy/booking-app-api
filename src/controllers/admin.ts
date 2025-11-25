import { Request, Response } from "express";
import {
  fetchBookingAnalytics,
  fetchBookings,
  fetchRevenueReport,
  fetchUsers,
} from "../services/admin.service";

// User Management and Permissions
export const getUsers = async (req: Request, res: Response) => {
  const response = await fetchUsers();
  res.json(response);
};

// Booking Management and Analytics
export const getBookings = async (req: Request, res: Response) => {
  const response = await fetchBookings();
  res.json(response);
};

export const getBookingAnalytics = async (req: Request, res: Response) => {
  const response = await fetchBookingAnalytics();
  res.json(response);
};

// Revenue Reporting
export const getRevenueReport = async (req: Request, res: Response) => {
  const response = await fetchRevenueReport();
  res.json(response);
};
