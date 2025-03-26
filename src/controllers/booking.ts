import { Request, Response } from "express";
import { roomBookingSchema } from "../schema/hotels";
import { formatPaginationResponse, handleValidationError } from "../utils/common-method";
import prisma from "../connect";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";
import { HTTPSuccessResponse } from "../helpers/success-response";

export const getBookings = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  // Fetch roles with pagination
  const booings = await prisma.booking.findMany({ skip, take: limit, where: { userId: req.user?.id }, include: { room: { include: { hotel: true } }, restaurant: true } });
  const totalRoles = await prisma.role.count();

  if (!booings || booings.length === 0) {
    throw new NotFoundException("No hotels found", ErrorCode.ROLE_NOT_FOUND);
  }

  const formattedResponse = formatPaginationResponse(booings, totalRoles, page, limit);

  const response = new HTTPSuccessResponse(
    "Hotels fetched successfully",
    200,
    formattedResponse
  );
  return res.status(response.statusCode).json(response);
}

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
        status: "CONFIRMED",
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