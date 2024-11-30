import { Request, Response, NextFunction } from "express";
import prisma from "../connect";
import { UnauthorizedException } from "../exceptions/unauthorized";

// Middleware to check permissions
const checkPermission = (givenPermissions: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    // 1. Fetch the user's permissions
    const userPermissions = await prisma.userRole.findFirst({
      where: { userId },
      select: {
        role: {
          select: {
            RolePermission: {
              select: {
                permission: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // 2. Flatten the permissions into a simple array of permission names
    const permissions = userPermissions?.role.RolePermission.map(
      (rolePermission) => rolePermission.permission.name
    );

    // Check if the required permission exists
    const hasPermission = permissions?.includes(givenPermissions);

    if (!hasPermission) {
      return next(
        new UnauthorizedException(
          "You don't have permission to access this resource",
          403
        )
      );
    }
    next();
  };
};

export default checkPermission;
