import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient().$extends({
    result: {
      address: {
        formattedAddress: {
          needs: {
            country: true,
            state: true,
            city: true,
            postalCode: true,
          },
          compute: (address: any) => {
            return `${address?.city}, ${address?.state}, ${address?.country}, ${address?.postalCode}`;
          },
        },
      },
    },
  });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
