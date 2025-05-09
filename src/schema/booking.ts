import { z } from "zod";

// Define the booking status enum
enum BookingStatus {
    PENDING,
    CONFIRMED,
    CANCELLED,
    COMPLETED,
}

// Define the Zod schema
export const reservationSchema = z.object({
    // userId: z
    //     .number()
    //     .int()
    //     .positive()
    //     .refine((value) => value > 0, {
    //         message: "userId is required and must be a positive integer",
    //     }),
    restaurantId: z
        .number()
        .int()
        .positive()
        .refine((value) => value > 0, {
            message: "restaurantId is required and must be a positive integer",
        }),
    bookingDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "bookingDate is required and must be a valid date",
    }),
    timeSlot: z
        .enum(["MORNING", "NOON", "AFTERNOON", "EVENING", "NIGHT"])
        .refine((val) => val.length > 0, {
            message: "timeSlot must be one of 'noon', 'evening', or 'late night'.",
        }),
    partySize: z
        .number()
        .int()
        .positive()
        .refine((value) => value > 0, {
            message: "partySize is required and must be a positive integer",
        }),
    // totalPrice: z
    //     .number()
    //     .positive()
    //     .refine((value) => value > 0, {
    //         message: "totalPrice is required and must be a positive number",
    //     }),
});

export const updateStatusSchema = z.object({
    bookingId: z.string().refine((id) => !isNaN(Number(id)) && Number(id) > 0, {
        message: "bookingId must be a positive integer",
    }),
    status: z
        .string()
        .refine((val) => Object.values(BookingStatus).includes(val as any), {
            message: `Status must be one of: ${Object.values(BookingStatus).join(
                ", "
            )}`,
        }),
});
