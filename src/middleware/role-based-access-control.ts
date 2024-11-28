import { Request, Response, NextFunction } from "express";
import prisma from "../connect";


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

    console.log(givenPermissions, permissions);

    // Check if the required permission exists
    const hasPermission = 
      permissions?.includes(givenPermissions)
    

    console.log('hasPermission', hasPermission)

    if (!hasPermission) {
      return res.status(403).json({ error: "Access denied" });
    }

    next();
  };
};

export default checkPermission;
