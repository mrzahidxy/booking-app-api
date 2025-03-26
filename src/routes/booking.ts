import { Router } from "express";
import { bookRoom, getBookings } from "../controllers/booking";
import { authMiddleware } from "../middleware/auth";



export const bookingRoute: Router = Router();

bookingRoute.post('/room', authMiddleware, bookRoom)
bookingRoute.get('/', authMiddleware, getBookings)