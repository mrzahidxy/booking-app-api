import { asyncHandler } from "../exceptions/async-handler";
import { Router } from "express";
import {
  assignRolePermission,
  assignUserRole,
  createPermission,
  createRole,
} from "../controllers/role-base-access-control";
import checkPermission from "../middleware/check-permission";
import { authMiddleware } from "../middleware/auth";

export const roleMenuPermissionRoutes: Router = Router();

roleMenuPermissionRoutes.post("/roles", [
  authMiddleware,
  checkPermission("CREATE_ROLE"),
  asyncHandler(createRole),
]);
roleMenuPermissionRoutes.post("/permissions", [
  authMiddleware,
  checkPermission("CREATE_PERMISSION"),
  asyncHandler(createPermission),
]);

roleMenuPermissionRoutes.post("/:roleId/permissions", [
  authMiddleware,
  checkPermission("CREATE_PERMISSION"),
  asyncHandler(assignRolePermission),
]);
roleMenuPermissionRoutes.post("/:userId/role", [
  authMiddleware,
  checkPermission("ASSIGNMENT_USER_ROLE"),
  asyncHandler(assignUserRole),
]);
