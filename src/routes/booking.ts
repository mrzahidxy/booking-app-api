import { Router } from "express";
import { bookingStatusUpdate, bookRoom, getBookings, getUserBookings } from "../controllers/booking";
import { authMiddleware } from "../middleware/auth";
import { asyncHandler } from "../exceptions/async-handler";
import { checkRoomAvailability } from "../controllers/hotel";



export const bookingRoute: Router = Router();

bookingRoute.post('/room', authMiddleware, bookRoom)
bookingRoute.get('/', authMiddleware, getUserBookings)
bookingRoute.get('/admin', authMiddleware, getBookings)
bookingRoute.put('/status/:id', authMiddleware, asyncHandler(bookingStatusUpdate))
bookingRoute.get('/check-room', asyncHandler(checkRoomAvailability) )