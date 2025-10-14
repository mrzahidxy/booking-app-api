import { Request, Response } from "express";
import { roomBookingSchema } from "../schema/hotels";
import {
  formatPaginationResponse,
  handleValidationError,
} from "../utils/common-method";
import prisma from "../connect";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";
import { HTTPSuccessResponse } from "../helpers/success-response";
import { bookingStatusSchema } from "../schema/booking";
import { BadRequestException } from "../exceptions/bad-request";
import { messaging } from "../config/firebaseAdmin";

/**
 * @openapi
 * /bookings/user:
 *   get:
 *     summary: Get all bookings for current user
 *     tags:
 *       - Bookings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of user bookings with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       userId:
 *                         type: integer
 *                       roomId:
 *                         type: integer
 *                       restaurantId:
 *                         type: integer
 *                       bookingDate:
 *                         type: string
 *                         format: date-time
 *                       roomQuantity:
 *                         type: integer
 *                       partySize:
 *                         type: integer
 *                       totalPrice:
 *                         type: number
 *                       status:
 *                         type: string
 *                         example: PENDING
 *                       room:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           hotelId:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           description:
 *                             type: string
 *                           price:
 *                             type: number
 *                           quantity:
 *                             type: integer
 *                           hotel:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                               name:
 *                                 type: string
 *                               address:
 *                                 type: string
 *                               city:
 *                                 type: string
 *                               country:
 *                                 type: string
 *                               rating:
 *                                 type: number
 *                               description:
 *                                 type: string
 *                               image:
 *                                 type: string
 *                               featured:
 *                                 type: boolean
 *                       restaurant:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           address:
 *                             type: string
 *                           city:
 *                             type: string
 *                           country:
 *                             type: string
 *                           description:
 *                             type: string
 *                           image:
 *                             type: string
 *                           seats:
 *                             type: integer
 *                           featured:
 *                             type: boolean
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No bookings found for user
 *       500:
 *         description: Internal server error
 */
// Get User Bookings
export const getUserBookings = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  // Get User Bookings
  const bookings = await prisma.booking.findMany({
    skip,
    take: limit,
    where: { userId: req.user?.id },
    include: {
      room: { include: { hotel: true } },
      restaurant: true,
      user: true,
    },
  });
  const totalBookings = await prisma.booking.count({
    where: { userId: req.user?.id },
  });

  if (!bookings || bookings.length === 0) {
    throw new NotFoundException(
      "No booking found",
      ErrorCode.BOOKING_NOT_FOUND
    );
  }

  const formattedResponse = formatPaginationResponse(
    bookings,
    totalBookings,
    page,
    limit
  );

  const response = new HTTPSuccessResponse(
    "Bookings fetched successfully",
    200,
    formattedResponse
  );
  return res.status(response.statusCode).json(response);
};

/**
 * @openapi
 * /bookings:
 *   get:
 *     summary: Get all bookings (admin only)
 *     tags:
 *       - Bookings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of all bookings with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       userId:
 *                         type: integer
 *                       roomId:
 *                         type: integer
 *                       restaurantId:
 *                         type: integer
 *                       bookingDate:
 *                         type: string
 *                         format: date-time
 *                       roomQuantity:
 *                         type: integer
 *                       partySize:
 *                         type: integer
 *                       totalPrice:
 *                         type: number
 *                       status:
 *                         type: string
 *                         example: PENDING
 *                       room:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           hotelId:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           description:
 *                             type: string
 *                           price:
 *                             type: number
 *                           quantity:
 *                             type: integer
 *                           hotel:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                               name:
 *                                 type: string
 *                               address:
 *                                 type: string
 *                               city:
 *                                 type: string
 *                               country:
 *                                 type: string
 *                               rating:
 *                                 type: number
 *                               description:
 *                                 type: string
 *                               image:
 *                                 type: string
 *                               featured:
 *                                 type: boolean
 *                       restaurant:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           address:
 *                             type: string
 *                           city:
 *                             type: string
 *                           country:
 *                             type: string
 *                           description:
 *                             type: string
 *                           image:
 *                             type: string
 *                           seats:
 *                             type: integer
 *                           featured:
 *                             type: boolean
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                           role:
 *                             type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - user not admin
 *       404:
 *         description: No bookings found
 *       500:
 *         description: Internal server error
 */
// Get All Bookings
export const getBookings = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  // Fetch roles with pagination
  const [totalBookings, bookings] = await prisma.$transaction([
    prisma.booking.count(),
    prisma.booking.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" }, // ← newest first
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

  const response = new HTTPSuccessResponse(
    "Hotels fetched successfully",
    200,
    formattedResponse
  );
  return res.status(response.statusCode).json(response);
};

/**
 * @openapi
 * /bookings/{id}/status:
 *   put:
 *     summary: Update booking status (admin only)
 *     tags:
 *       - Bookings
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
 *               status:
 *                 type: string
 *                 example: CONFIRMED
 *               type:
 *                 type: string
 *                 example: room
 *     responses:
 *       200:
 *         description: Booking status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 booking:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     userId:
 *                       type: integer
 *                     roomId:
 *                       type: integer
 *                     restaurantId:
 *                       type: integer
 *                     bookingDate:
 *                       type: string
 *                       format: date-time
 *                     roomQuantity:
 *                       type: integer
 *                     partySize:
 *                       type: integer
 *                     totalPrice:
 *                       type: number
 *                     status:
 *                       type: string
 *                       example: CONFIRMED
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - user not admin
 *       404:
 *         description: Booking not found
 *       409:
 *         description: Not enough rooms/seats available
 *       500:
 *         description: Internal server error
 */
// Update booking status
export const bookingStatusUpdate = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, type } = req.body;

  // Validate request data
  const validationResult = bookingStatusSchema.safeParse({
    bookingId: id,
    status,
  });

  if (!validationResult.success) {
    return handleValidationError(res, validationResult);
  }

  const validStatus = validationResult.data.status;

  const updatedBooking = await prisma.$transaction(async (tx) => {
    // Check if booking exists
    const existingBooking = await prisma.booking.findUnique({
      where: { id: +id },
      include: {
        user: true,
      },
    });

    if (!existingBooking) {
      throw new NotFoundException(
        "Booking not found",
        ErrorCode.BOOKING_NOT_FOUND
      );
    }

    if (validStatus === "CONFIRMED") {
      // Check if booking is hotel
      if (type === "room") {
        const room = await tx.room.findUnique({
          where: { id: existingBooking.roomId! },
        });

        if (!room) {
          throw new NotFoundException(
            "Room not found",
            ErrorCode.ROOM_NOT_FOUND
          );
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
        // Check if booking is restaurant
        const restaurant = await tx.restaurant.findUnique({
          where: { id: existingBooking.restaurantId! },
          select: { seats: true },
        });

        if (!restaurant) {
          throw new NotFoundException(
            "Restaurant not found",
            ErrorCode.RESTAURANT_NOT_FOUND
          );
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

    // Update booking status
    const updatedBooking = await tx.booking.update({
      where: { id: +id },
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

    // Send notification after booking status is updated
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

    return updatedBooking;
  });

  // Send success response
  return res.status(200).json({
    message: "Booking status updated successfully",
    booking: updatedBooking,
  });
};

/**
 * @openapi
 * /bookings/room:
 *   post:
 *     summary: Book a room
 *     tags:
 *       - Bookings
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roomId:
 *                 type: integer
 *               bookingDate:
 *                 type: string
 *                 format: date
 *               quantity:
 *                 type: integer
 *             required:
 *               - roomId
 *               - bookingDate
 *               - quantity
 *     responses:
 *       201:
 *         description: Room booked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 booking:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     userId:
 *                       type: integer
 *                     roomId:
 *                       type: integer
 *                     restaurantId:
 *                       type: integer
 *                     bookingDate:
 *                       type: string
 *                       format: date-time
 *                     roomQuantity:
 *                       type: integer
 *                     partySize:
 *                       type: integer
 *                     totalPrice:
 *                       type: number
 *                     status:
 *                       type: string
 *                       example: PENDING
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Room not found
 *       500:
 *         description: Internal server error
 */
// Book a Room
export const bookRoom = async (req: Request, res: Response) => {
  // Validate request data
  const validateResult = roomBookingSchema.safeParse({
    ...req.body,
    userId: req.user?.id,
  });

  if (!validateResult.success) {
    handleValidationError(res, validateResult);
  }

  const { userId, roomId, bookingDate, quantity } = validateResult.data!;

  // Find the room
  const room = await prisma.room.findUnique({
    where: { id: roomId },
  });

  if (!room) {
    throw new NotFoundException("Room not found", ErrorCode.ROOM_NOT_FOUND);
  }

  // Calculate total price
  const totalPrice = room.price * Number(quantity);

  // Create booking
  const booking = await prisma.booking.create({
    data: {
      userId,
      roomId,
      bookingDate: new Date(bookingDate),
      totalPrice,
      status: "PENDING",
      roomQuantity: Number(quantity),
    },
  });

  // Send success response
  const response = new HTTPSuccessResponse(
    "Room booked successfully",
    201,
    booking
  );
  res.status(response.statusCode).json(response);
};
