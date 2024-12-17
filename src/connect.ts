import { PrismaClient } from "@prisma/client";

declare global {
  // Declare a global variable to store the Prisma client instance
  var prismaGlobal: PrismaClient | undefined;
}

// Create a Prisma client singleton
const prisma = globalThis.prismaGlobal ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma; // Cache the instance globally in development
}

export default prisma;
