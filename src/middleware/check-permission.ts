import { Request, Response, NextFunction } from "express";
import { UnauthorizedException } from "../exceptions/unauthorized";

const checkPermission = (requiredPermission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.id) {
        throw new UnauthorizedException("User not authenticated", 401);
      }

      if (!req.userPermissions?.has(requiredPermission)) {
        return res.status(403).json({
          error: "Forbidden",
          message: "You don't have the required permission",
        });
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
};

export default checkPermission;
