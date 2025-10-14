
import { Request, Response } from "express";
import prisma from "../connect";
import { HTTPSuccessResponse } from "../helpers/success-response";

import {
  hotelSchema,
  roomSchema,
  RoomType,
} from "../schema/hotels";
import { formatPaginationResponse, handleValidationError } from "../utils/common-method";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";
import { Prisma } from "@prisma/client";
import { BadRequestException } from "../exceptions/bad-request";




/**
 * @openapi
 * /hotels/{id}:
 *   post:
 *     summary: Create or update a hotel
 *     tags:
 *       - Hotels
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         description: Hotel ID (optional for create, required for update)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *               description:
 *                 type: string
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *               image:
 *                 type: string
 *               rooms:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     roomType:
 *                       type: string
 *                       enum:
 *                         - STANDARD
 *                         - DELUXE
 *                         - SUITE
 *                     price:
 *                       type: number
 *                     image:
 *                       type: string
 *                     amenities:
 *                       type: array
 *                       items:
 *                         type: string
 *                     quantity:
 *                       type: integer
 *             required:
 *               - name
 *               - location
 *               - description
 *               - amenities
 *               - image
 *     responses:
 *       200:
 *         description: Hotel updated successfully
 *       201:
 *         description: Hotel created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Hotel not found
 *       500:
 *         description: Internal server error
 */
export const CreateUpdateHotel = async (req: Request, res: Response) => {
  // ✅ Validate hotel data
  const validation = hotelSchema.safeParse(req.body);
  if (!validation.success) return handleValidationError(res, validation);

  const { name, location, description, amenities, image, rooms } = validation.data;
  const hotelId = req.params.id ? +req.params.id : null;

  let hotel;

  if (hotelId) {
    // ✅ **Update Hotel**
    hotel = await prisma.hotel.update({
      where: { id: hotelId },
      data: { name, location, image, description, amenities },
    });
  } else {
    // ✅ **Create Hotel**
    hotel = await prisma.hotel.create({
      data: { name, location, image, description, amenities },
    });
  }

  // 🏨 **Process Rooms (if provided & valid)**
  if (rooms?.length) {
    const validRooms = rooms
      .map((room) => roomSchema.safeParse(room))
      .filter((res) => res.success)
      .map((res) => res.data); // Extract only valid room data

    // 🔍 **Fetch Existing Rooms for Hotel**
    const existingRooms = await prisma.room.findMany({
      where: { hotelId: hotel.id },
      select: { id: true }, // Only fetch room IDs
    });

    const existingRoomIds = new Set(existingRooms.map((room) => room.id));
    const incomingRoomIds = new Set(validRooms.map((room) => room.id).filter(Boolean));

    // 🔥 **Delete Rooms That Are No Longer in the Request**
    const roomsToDelete = [...existingRoomIds].filter((id) => !incomingRoomIds.has(id));

    if (roomsToDelete.length > 0) {
      await prisma.room.deleteMany({
        where: { id: { in: roomsToDelete } },
      });
    }

    // 🔄 **Process Each Room (Create or Update)**
    await Promise.all(
      validRooms.map(async ({ id, roomType, price, image, amenities, quantity }) => {
        if (id) {
          // ✅ Update Existing Room
          await prisma.room.update({
            where: { id },
            data: { roomType, price: +price, image, amenities, quantity },
          });
        } else {
          // ✅ Create New Room
          await prisma.room.create({
            data: { hotelId: hotel.id, roomType, price: +price, image, amenities, quantity },
          });
        }
      })
    );
  } else {
    // 🔥 If rooms array is empty, delete all existing rooms for the hotel
    await prisma.room.deleteMany({
      where: { hotelId: hotel.id },
    });
  }

  // 📤 **Return Response**
  return res.status(hotelId ? 200 : 201).json(
    new HTTPSuccessResponse(
      `Hotel ${hotelId ? "updated" : "created"} successfully`,
      hotelId ? 200 : 201,
      hotel
    )
  );
};


/**
 * @openapi
 * /hotels/{id}:
 *   delete:
 *     summary: Delete a hotel
 *     tags:
 *       - Hotels
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Hotel deleted successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Hotel not found
 *       500:
 *         description: Internal server error
 */
// Delete a Hotel
export const deleteHotel = async (req: Request, res: Response) => {
  const hotelId = +req.params.id;

  const hotel = await prisma.hotel.findUnique({
    where: { id: hotelId },
    include: { rooms: true }, // Fetch related rooms
  });

  if (!hotel) {
    throw new NotFoundException("Hotel not found", ErrorCode.HOTEL_NOT_FOUND);
  }

  await prisma.room.deleteMany({
    where: { hotelId },
  });

  await prisma.hotel.delete({
    where: { id: hotelId },
  });


  const response = new HTTPSuccessResponse(
    "Hotel deleted successfully",
    200,
    hotel
  );
  return res.status(response.statusCode).json(response);
}

/**
 * @openapi
 * /hotels:
 *   get:
 *     summary: Get all hotels with pagination
 *     tags:
 *       - Hotels
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of hotels
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       500:
 *         description: Internal server error
 */
// Get All Hotels
export const getHotels = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  // Fetch roles with pagination
  const hotels = await prisma.hotel.findMany({ skip, take: limit, include: { rooms: true } });
  const totalHotels = await prisma.hotel.count();

  // if (!hotels || hotels.length === 0) {
  //   throw new NotFoundException("No hotels found", ErrorCode.HOTEL_NOT_FOUND);
  // }

  const formattedResponse = formatPaginationResponse(hotels ?? [], totalHotels, page, limit);

  const response = new HTTPSuccessResponse(
    "Hotels fetched successfully",
    200,
    formattedResponse
  );
  return res.status(response.statusCode).json(response);
}

/**
 * @openapi
 * /hotels/{id}:
 *   get:
 *     summary: Get detailed hotel information including rooms and reviews
 *     tags:
 *       - Hotels
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Hotel details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     location:
 *                       type: string
 *                     description:
 *                       type: string
 *                     image:
 *                       type: string
 *                     rooms:
 *                       type: array
 *                       items:
 *                         type: object
 *                     reviews:
 *                       type: array
 *                       items:
 *                         type: object
 *       404:
 *         description: Hotel not found
 *       500:
 *         description: Internal server error
 */
// Get Detailed Hotel Information including Rooms
export const getHotelDetails = async (req: Request, res: Response) => {
  const hotelId = +req.params.id;
  const hotel = await prisma.hotel.findUnique({
    where: { id: hotelId },
    include: {
      rooms: true,
      reviews: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!hotel) {
    throw new NotFoundException("Hotel not found", ErrorCode.HOTEL_NOT_FOUND);
  }

  const response = new HTTPSuccessResponse(
    "Hotel details fetched successfully",
    200,
    hotel
  );
  res.status(response.statusCode).json(response);
};


/**
 * @openapi
 * /hotels/search:
 *   get:
 *     summary: Search hotels by location, price range, and room type
 *     tags:
 *       - Hotels
 *     parameters:
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: roomType
 *         schema:
 *           type: string
 *           enum:
 *             - STANDARD
 *             - DELUXE
 *             - SUITE
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of matching hotels
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       500:
 *         description: Internal server error
 */
// Search Hotels by Location, Room Type, and Price Range
export const searchHotels = async (req: Request, res: Response) => {

  const { location, minPrice, maxPrice, roomType, name } = req.query;

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;


  const whereClause = {
    ...(location && {
      location: {
        contains: location as string,
        mode: Prisma.QueryMode.insensitive,
      }
    }),
    ...(name && {
      name: {
        contains: name as string,
        mode: Prisma.QueryMode.insensitive,
      },
    }),
    rooms: {
      some: {
        ...(minPrice && { price: { gte: +minPrice } }),
        ...(maxPrice && { price: { lte: +maxPrice } }),
        ...(roomType && { roomType: roomType as RoomType }),
      },
    },
  }

  // Fetch paginated data
  const hotels = await prisma.hotel.findMany({
    where: whereClause,
    include: { rooms: true },
    skip,
    take: limit,
  });

  const totalHotels = await prisma.hotel.count({
    where: whereClause,
  });


  if (!hotels) {
     throw new NotFoundException("Something went wrong", 404)
  }

  const formattedResponse = formatPaginationResponse(hotels ?? [], totalHotels, page, limit);

  const response = new HTTPSuccessResponse(
    "Hotels fetched successfully",
    200,
    formattedResponse
  );
  res.status(response.statusCode).json(response);
};

/**
 * @openapi
 * /hotels/availability:
 *   get:
 *     summary: Check room availability for a specific date
 *     tags:
 *       - Hotels
 *     parameters:
 *       - in: query
 *         name: roomId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: quantity
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Room availability status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     isAvailable:
 *                       type: boolean
 *                     availAbality:
 *                       type: integer
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
export const checkRoomAvailability = async (
  req: Request,
  res: Response
): Promise<Response> => {
  // Extract query parameters
  const { roomId, date, quantity } = req.query as {
    roomId: string;
    date: string;
    quantity: string
  };

  if (!roomId || !date || !quantity) {
    throw new BadRequestException(
      "Missing required parameters",
      ErrorCode.BAD_REQUEST
    );
  }

  // Fetch room details
  const room = await prisma.room.findUnique({
    where: { id: +roomId },
    select: { quantity: true },
  });

  if (!room) {
    throw new NotFoundException("Room not found", ErrorCode.ROOM_NOT_FOUND);
  }

  // Fetch confirmed bookings for the specified restaurant
  const bookings = await prisma.booking.findMany({
    where: {
      roomId: +roomId,
      bookingDate: new Date(date),
      status: "CONFIRMED",
    },
  });

  // Calculate availability based on existing bookings and requested party size
  const totalBookedRooms = bookings.reduce(
    (total, booking) => total + (booking.roomQuantity ?? 0),
    0
  );

  const requestedQuantity = Number(quantity);

  const isAvailable =
    totalBookedRooms + requestedQuantity <= room.quantity;

  const availAbality = room.quantity - totalBookedRooms;

  const response = new HTTPSuccessResponse(
    "Table availability checked successfully",
    200,
    { isAvailable, availAbality: availAbality }
  );

  return res.status(response.statusCode).json(response);
};