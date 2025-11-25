import prisma from "../utils/prisma";
import { HTTPSuccessResponse } from "../helpers/success-response";

export const fetchUsers = async () => {
  const users = await prisma.user.findMany();
  return new HTTPSuccessResponse("Users fetched successfully", 200, users);
};

export const fetchBookings = async () => {
  const bookings = await prisma.booking.findMany({
    include: { user: true, room: true, restaurant: true },
  });
  return new HTTPSuccessResponse("Bookings fetched successfully", 200, bookings);
};

export const fetchBookingAnalytics = async () => {
  const [totalBookings, confirmedBookings, cancelledBookings] =
    await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { status: "CONFIRMED" } }),
      prisma.booking.count({ where: { status: "CANCELLED" } }),
    ]);

  return new HTTPSuccessResponse("Booking analytics fetched successfully", 200, {
    totalBookings,
    confirmedBookings,
    cancelledBookings,
  });
};

export const fetchRevenueReport = async () => {
  const revenueData = await prisma.booking.groupBy({
    by: ["status"],
    _sum: { totalPrice: true },
  });

  return new HTTPSuccessResponse("Revenue report generated successfully", 200, revenueData);
};
