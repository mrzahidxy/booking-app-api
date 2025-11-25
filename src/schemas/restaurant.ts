import { z } from "zod";

// ✅ Restaurant Schema
export const restaurantSchema = z.object({
    name: z.string().min(3, "Restaurant name must be at least 3 characters long"),
    location: z.string().min(3, "Location must be at least 3 characters long"),
    description: z.string().optional(),
    cuisine: z.array(z.string()).optional(),
    seats: z.number().optional(),
    menu: z.array(z.object({ name: z.string(), price: z.number() }).optional()).optional(),
    image: z.array(z.string()).optional(),
});