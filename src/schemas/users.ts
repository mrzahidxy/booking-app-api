import { z } from "zod";

export const SignUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});


export const AddressSchema = z.object({
  address: z.string(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  postalCode: z.number(),
});

export const updateUserSchema = z.object({
  defaultShippingAddress: z.number().optional(),
  defaultBillingAddress: z.number().optional(),
});


export const updateUserRoleSchema = z.object({
  role: z.enum(['ADMIN', 'USER']),
});
