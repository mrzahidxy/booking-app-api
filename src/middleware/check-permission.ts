import { Request, Response, NextFunction } from "express";
import prisma from "../connect";
import { UnauthorizedException } from "../exceptions/unauthorized";

interface CustomRequest extends Request {
  userPermissions?: Set<string>;
  currentUserId?: number;
}

const checkPermission = (requiredPermission: string) => {
  return async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;

      // Ensure the user is authenticated
      if (!userId) {
        throw new UnauthorizedException("User not authenticated", 401);
      }

      // Load user permissions if not cached or user ID changes
      if (!req.userPermissions || req.currentUserId !== userId) {
        req.currentUserId = userId;

        const permissions = await prisma.permission.findMany({
          where: {
            RolePermission: {
              some: {
                role: {
                  Users: { some: { id: userId } },
                },
              },
            },
          },
          select: { name: true },
        });

        req.userPermissions = new Set(permissions.map((perm) => perm.name));
      }

      // Check if the user has the required permission
      if (!req.userPermissions.has(requiredPermission)) {
        // Dynamically check for the required permission in the database
        const hasPermission = await prisma.permission.findFirst({
          where: {
            name: requiredPermission,
            RolePermission: {
              some: {
                role: {
                  Users: { some: { id: userId } },
                },
              },
            },
          },
          select: { name: true },
        });


        console.log(req.userPermissions)

        // Update the cached permissions if the required permission is found
        if (hasPermission) {
          req.userPermissions.add(requiredPermission);
        } else {
          return res.status(403).json({
            error: "Forbidden",
            message: "You don't have the required permission",
          });
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default checkPermission;
