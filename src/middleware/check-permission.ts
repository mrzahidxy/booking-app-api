import { Request, Response, NextFunction } from "express";
import prisma from "../connect";
import { UnauthorizedException } from "../exceptions/unauthorized";

interface CustomRequest extends Request {
  userPermissions?: string[];
}

// Middleware to check permissions
const checkPermission = (requiredPermission: string) => {
  return async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new UnauthorizedException("User not authenticated", 401);
      }

      if (!req.userPermissions) {
        const userPermissions = await prisma.permission.findMany({
          where: {
            RolePermission: {
              some: {
                role: {
                  Users: {
                    some: {
                      id: userId,
                    },
                  },
                },
              },
            },
          },
        });
        req.userPermissions = userPermissions.map((p) => p.name);
      }

      if (!req.userPermissions.includes(requiredPermission)) {
        return res.status(403).json({
          error: "Forbidden",
          message: "You don't have the required permission",
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default checkPermission;
