import { z } from "zod";

export const hotelSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  location: z.string().min(1, { message: "Location is required" }),
  image: z.string().min(1, { message: "Image is required" }),
});

export const hotelUpdateSchema = z.object({
  name: z.union([
    z.string().min(1, { message: "Name is required" }),
    z.undefined(),
  ]),
  location: z.union([
    z.string().min(1, { message: "Location is required" }),
    z.undefined(),
  ]),
  image: z.union([
    z.string().min(1, { message: "Image is required" }),
    z.undefined(),
  ]),
});

// Define the RoomType enum
enum RoomType {
  SINGLE = "SINGLE",
  DOUBLE = "DOUBLE",
  TWIN = "TWIN",
  TRIPLE = "TRIPLE",
}

enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
}

// Define the room schema using zod
export const roomSchema = z.object({
  roomType: z.nativeEnum(RoomType, {
    message: "Room type must be SINGLE, DOUBLE, TWIN, or TRIPLE",
  }),
  price: z.string().min(1, { message: "Price is required" }),
  image: z.string().min(1, { message: "Image is required" }),
});

export const roomBookingSchema = z.object({
  roomId: z.number().min(1, { message: "Room ID is required" }),
  userId: z.number().min(1, { message: "User ID is required" }),
  bookingDate: z.string().min(1, { message: "Booking date is required" }),
  quantity: z.number().min(1, { message: "Quantity is required" }),
});

export { RoomType };
