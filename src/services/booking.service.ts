import { BookingStatus } from "@prisma/client";
import { BadRequestException } from "../exceptions/bad-request";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";
import { HTTPSuccessResponse } from "../helpers/success-response";
import prisma from "../utils/prisma";
import { formatPaginationResponse } from "../utils/common-method";
import { messaging } from "./firebase-admin.service";

export const fetchUserBookings = async (params: {
  userId?: number;
  page?: number;
  limit?: number;
}) => {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const skip = (page - 1) * limit;

  const bookings = await prisma.booking.findMany({
    skip,
    take: limit,
    where: { userId: params.userId },
    include: {
      room: { include: { hotel: true } },
      restaurant: true,
      user: true,
    },
  });
  const totalBookings = await prisma.booking.count({
    where: { userId: params.userId },
  });

  if (!bookings || bookings.length === 0) {
    throw new NotFoundException("No booking found", ErrorCode.BOOKING_NOT_FOUND);
  }

  const formattedResponse = formatPaginationResponse(
    bookings,
    totalBookings,
    page,
    limit
  );

  return new HTTPSuccessResponse(
    "Bookings fetched successfully",
    200,
    formattedResponse
  );
};

export const fetchBookings = async (params: { page?: number; limit?: number }) => {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const skip = (page - 1) * limit;

  const [totalBookings, bookings] = await prisma.$transaction([
    prisma.booking.count(),
    prisma.booking.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        room: { include: { hotel: true } },
        restaurant: true,
        user: true,
      },
    }),
  ]);

  if (!bookings) {
    throw new NotFoundException("No hotels found", ErrorCode.ROLE_NOT_FOUND);
  }

  const formattedResponse = formatPaginationResponse(
    bookings,
    totalBookings,
    page,
    limit
  );

  return new HTTPSuccessResponse("Hotels fetched successfully", 200, formattedResponse);
};

export const updateBookingStatus = async (params: {
  bookingId: number;
  status: BookingStatus;
  type?: string;
}) => {
  const { bookingId, status, type } = params;

  const updatedBooking = await prisma.$transaction(async (tx) => {
    const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
      },
    });

    if (!existingBooking) {
      throw new NotFoundException("Booking not found", ErrorCode.BOOKING_NOT_FOUND);
    }

    if (status === "CONFIRMED") {
      if (type === "room") {
        const room = await tx.room.findUnique({
          where: { id: existingBooking.roomId! },
        });

        if (!room) {
          throw new NotFoundException("Room not found", ErrorCode.ROOM_NOT_FOUND);
        }

        const roomAvailable = room.quantity;
        const roomBooked = await tx.booking.aggregate({
          where: {
            roomId: existingBooking.roomId!,
            bookingDate: existingBooking.bookingDate,
            status: "CONFIRMED",
          },
          _sum: {
            roomQuantity: true,
          },
        });

        const totalBookedRooms = roomBooked._sum.roomQuantity ?? 0;
        const requestedRoomQuantity = existingBooking.roomQuantity ?? 1;
        const isAvailable =
          totalBookedRooms + requestedRoomQuantity <= roomAvailable;

        if (!isAvailable) {
          throw new BadRequestException(
            "Not enough seats available",
            ErrorCode.NOT_ENOUGH_ROOMS
          );
        }
      }

      if (type === "restaurant") {
        const restaurant = await tx.restaurant.findUnique({
          where: { id: existingBooking.restaurantId! },
          select: { seats: true },
        });

        if (!restaurant) {
          throw new NotFoundException("Restaurant not found", ErrorCode.RESTAURANT_NOT_FOUND);
        }

        const seatAvailable = restaurant.seats!;
        const seatBooked = await tx.booking.aggregate({
          where: {
            restaurantId: existingBooking.restaurantId!,
            bookingDate: existingBooking.bookingDate,
            status: "CONFIRMED",
          },
          _sum: {
            partySize: true,
          },
        });

        const totalBookedSeats = seatBooked._sum.partySize ?? 0;
        const requestedPartySize = existingBooking.partySize ?? 1;
        const isAvailable =
          totalBookedSeats + requestedPartySize <= seatAvailable;

        if (!isAvailable) {
          throw new BadRequestException(
            "Not enough seats available",
            ErrorCode.NOT_ENOUGH_SEATS
          );
        }
      }
    }

    const updated = await tx.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    await prisma.notification.create({
      data: {
        userId: existingBooking.userId,
        title: "Booking status updated",
        body: `Your booking is now ${status}`,
        metadata: { bookingId: existingBooking.id },
      },
    });

    const fcmToken = existingBooking.user.fcmToken;

    if (fcmToken) {
      const message = {
        notification: {
          title: "Booking Status Updated",
          body: `Your booking status has been updated to ${status}`,
        },
        token: fcmToken,
      };

      try {
        await messaging.send(message);
      } catch (error) {
        console.error("Error sending notification:", error);
      }
    }

    return updated;
  });

  return {
    statusCode: 200,
    body: {
      message: "Booking status updated successfully",
      booking: updatedBooking,
    },
  };
};

export const createRoomBooking = async (params: {
  userId: number;
  roomId: number;
  bookingDate: Date;
  quantity: number;
}) => {
  const { userId, roomId, bookingDate, quantity } = params;

  const room = await prisma.room.findUnique({
    where: { id: roomId },
  });

  if (!room) {
    throw new NotFoundException("Room not found", ErrorCode.ROOM_NOT_FOUND);
  }

  const totalPrice = room.price * Number(quantity);

  const booking = await prisma.booking.create({
    data: {
      userId,
      roomId,
      bookingDate,
      totalPrice,
      status: "PENDING",
      roomQuantity: Number(quantity),
    },
  });

  return new HTTPSuccessResponse("Room booked successfully", 201, booking);
};
