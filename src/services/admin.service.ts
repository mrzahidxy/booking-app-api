import prisma from "../utils/prisma";
import { HTTPSuccessResponse } from "../helpers/success-response";

export const getAdminDashboardStatsService = async () => {
  const [
    totalUsers,
    totalHotels,
    totalRestaurants,
    totalRooms,
    totalBookings,
    totalReviews,
    totalNotifications,
    totalPayments,
    bookingStatusCounts,
    paymentStatusCounts,
    paymentTotals,
  ] = await prisma.$transaction([
    prisma.user.count(),
    prisma.hotel.count(),
    prisma.restaurant.count(),
    prisma.room.count(),
    prisma.booking.count(),
    prisma.review.count(),
    prisma.notification.count(),
    prisma.payment.count(),
    prisma.booking.groupBy({
      by: ["status"],
      _count: true,
      orderBy: { status: "asc" },
    }),
    prisma.payment.groupBy({
      by: ["status"],
      _count: true,
      orderBy: { status: "asc" },
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
    }),
  ]);

  const bookingsByStatus = bookingStatusCounts.reduce<Record<string, number>>(
    (acc, entry) => {
      acc[entry.status] = (entry._count as number) ?? 0;
      return acc;
    },
    {}
  );

  const paymentsByStatus = paymentStatusCounts.reduce<Record<string, number>>(
    (acc, entry) => {
      acc[entry.status] = (entry._count as number) ?? 0;
      return acc;
    },
    {}
  );

  return new HTTPSuccessResponse("Dashboard stats fetched successfully", 200, {
    totals: {
      users: totalUsers,
      hotels: totalHotels,
      restaurants: totalRestaurants,
      rooms: totalRooms,
      bookings: totalBookings,
      reviews: totalReviews,
      notifications: totalNotifications,
      payments: totalPayments,
    },
    bookingsByStatus,
    paymentsByStatus,
    revenue: paymentTotals._sum.amount ?? 0,
  });
};
