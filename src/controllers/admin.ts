import { Request, Response } from "express";
import prisma from "../connect";
import { HTTPSuccessResponse } from "../helpers/success-response";

// User Management and Permissions
export const getUsers = async (req: Request, res: Response) => {
  const users = await prisma.user.findMany();
  res.json(new HTTPSuccessResponse("Users fetched successfully", 200, users));
};

// Booking Management and Analytics
export const getBookings = async (req: Request, res: Response) => {
  const bookings = await prisma.booking.findMany({
    include: { user: true, room: true, restaurant: true },
  });
  res.json(
    new HTTPSuccessResponse("Bookings fetched successfully", 200, bookings)
  );
};

export const getBookingAnalytics = async (req: Request, res: Response) => {
  const [totalBookings, confirmedBookings, cancelledBookings] =
    await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { status: "CONFIRMED" } }),
      prisma.booking.count({ where: { status: "CANCELLED" } }),
    ]);
  res.json(
    new HTTPSuccessResponse("Booking analytics fetched successfully", 200, {
      totalBookings,
      confirmedBookings,
      cancelledBookings,
    })
  );
};

// Revenue Reporting
export const getRevenueReport = async (req: Request, res: Response) => {
  const revenueData = await prisma.booking.groupBy({
    by: ["status"],
    _sum: { totalPrice: true },
  });
  res.json(
    new HTTPSuccessResponse(
      "Revenue report generated successfully",
      200,
      revenueData
    )
  );
};

