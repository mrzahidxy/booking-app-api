// import { Request, Response } from "express";
// import prisma from "../connect";
// import { HTTPSuccessResponse } from "../helpers/success-response";
// import { NotFoundException } from "../exceptions/not-found";
// import { ErrorCode } from "../exceptions/root";

// // Helper function to handle errors
// const handleError = (res: Response, message: string, error: any) => {
//   res.status(500).json({ error: message, details: error.message });
// };

// // User Management and Permissions
// export const getUsers = async (req: Request, res: Response) => {
//   try {
//     const users = await prisma.user.findMany();
//     res.json(new HTTPSuccessResponse("Users fetched successfully", 200, users));
//   } catch (error) {
//     handleError(res, "Failed to fetch users", error);
//   }
// };

// export const updateUserPermissions = async (req: Request, res: Response) => {
//   const { userId, role } = req.body;
//   try {
//     const user = await prisma.user.update({ where: { id: userId }, data: { role } });
//     res.json(new HTTPSuccessResponse("User permissions updated successfully", 200, user));
//   } catch (error) {
//     handleError(res, "Failed to update user permissions", error);
//   }
// };

// // Hotel and Restaurant Management
// export const getAllHotels = async (req: Request, res: Response) => {
//   try {
//     const hotels = await prisma.hotel.findMany({ include: { rooms: true } });
//     res.json(new HTTPSuccessResponse("Hotels fetched successfully", 200, hotels));
//   } catch (error) {
//     handleError(res, "Failed to fetch hotels", error);
//   }
// };


// // Booking Management and Analytics
// export const getBookings = async (req: Request, res: Response) => {
//   try {
//     const bookings = await prisma.booking.findMany({
//       include: { user: true, room: true, restaurant: true },
//     });
//     res.json(new HTTPSuccessResponse("Bookings fetched successfully", 200, bookings));
//   } catch (error) {
//     handleError(res, "Failed to fetch bookings", error);
//   }
// };

// export const getBookingAnalytics = async (req: Request, res: Response) => {
//   try {
//     const [totalBookings, confirmedBookings, cancelledBookings] = await Promise.all([
//       prisma.booking.count(),
//       prisma.booking.count({ where: { status: "Confirmed" } }),
//       prisma.booking.count({ where: { status: "Cancelled" } }),
//     ]);
//     res.json(new HTTPSuccessResponse("Booking analytics fetched successfully", 200, {
//       totalBookings, confirmedBookings, cancelledBookings
//     }));
//   } catch (error) {
//     handleError(res, "Failed to fetch booking analytics", error);
//   }
// };

// // Revenue Reporting
// export const getRevenueReport = async (req: Request, res: Response) => {
//   try {
//     const revenueData = await prisma.booking.groupBy({
//       by: ["status"],
//       _sum: { totalPrice: true },
//     });
//     res.json(new HTTPSuccessResponse("Revenue report generated successfully", 200, revenueData));
//   } catch (error) {
//     handleError(res, "Failed to generate revenue report", error);
//   }
// };

// // Hotel and Restaurant Creation
// export const createHotel = async (req: Request, res: Response) => {
//   const { name, location, rooms } = req.body;
//   try {
//     const hotel = await prisma.hotel.create({
//       data: {
//         name,
//         location,
//         rooms: { create: rooms.map(({ roomType, price }) => ({ roomType, price })) },
//       },
//     });
//     res.json(new HTTPSuccessResponse("Hotel created successfully", 201, hotel));
//   } catch (error) {
//     handleError(res, "Failed to create hotel", error);
//   }
// };


// // Update Hotel, Room, and Restaurant Details
// export const updateHotel = async (req: Request, res: Response) => {
//   const hotelId = +req.params.id;
//   const { name, location } = req.body;
//   try {
//     const hotel = await prisma.hotel.update({
//       where: { id: hotelId },
//       data: { name, location },
//     });
//     res.json(new HTTPSuccessResponse("Hotel updated successfully", 200, hotel));
//   } catch (error) {
//     throw new NotFoundException("Hotel not found", ErrorCode.HOTEL_NOT_FOUND);
//   }
// };

// export const updateRoom = async (req: Request, res: Response) => {
//   const roomId = +req.params.id;
//   const { roomType, price } = req.body;
//   try {
//     const room = await prisma.room.update({
//       where: { id: roomId },
//       data: { roomType, price },
//     });
//     res.json(new HTTPSuccessResponse("Room updated successfully", 200, room));
//   } catch (error) {
//     throw new NotFoundException("Room not found", ErrorCode.ROOM_NOT_FOUND);
//   }
// };


// // Update Booking Status
// export const updateBookingStatus = async (req: Request, res: Response) => {
//   const bookingId = +req.params.id;
//   const { status } = req.body;
//   try {
//     const booking = await prisma.booking.update({
//       where: { id: bookingId },
//       data: { status },
//     });
//     res.json(new HTTPSuccessResponse("Booking status updated successfully", 200, booking));
//   } catch (error) {
//     throw new NotFoundException("Booking not found", ErrorCode.BOOKING_NOT_FOUND);
//   }
// };
