import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient | null = null;

// Lazy-initialize Prisma so cold starts and simple routes (like /live) don't spin up a DB connection until needed.
const getPrisma = (): PrismaClient => {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
};

// Lazy proxy so existing imports don't trigger a connection until first query.
const prismaProxy = new Proxy({} as PrismaClient, {
  get: (_target, prop, receiver) => {
    const client = getPrisma();
    const value = Reflect.get(client as any, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export default prismaProxy;
