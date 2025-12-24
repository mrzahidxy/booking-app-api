import { Router } from "express";
import { bookingStatusUpdate, bookRoom, getBookings, getUserBookings } from "../controllers/booking";
import { authMiddleware } from "../middleware/auth";
import { asyncHandler } from "../exceptions/async-handler";
import { checkRoomAvailability } from "../controllers/hotel";
import { checkTableAvailability, reserveTable } from "../controllers/restaurant";
import checkPermission from "../middleware/check-permission";



export const bookingRoute: Router = Router();

bookingRoute.post('/room', authMiddleware, asyncHandler(bookRoom))
bookingRoute.get('/', authMiddleware, asyncHandler(getUserBookings))
bookingRoute.get('/admin', authMiddleware, checkPermission("MANAGE_BOOKING"), asyncHandler(getBookings))
bookingRoute.put('/status/:id', authMiddleware, checkPermission("MANAGE_BOOKING"), asyncHandler(bookingStatusUpdate))
bookingRoute.get('/check-room', asyncHandler(checkRoomAvailability) )
bookingRoute.post('/restaurant', authMiddleware, asyncHandler(reserveTable))
bookingRoute.get('/check-restaurant', asyncHandler(checkTableAvailability))
