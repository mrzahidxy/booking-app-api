import { asyncHandler } from "../exceptions/async-handler";
import { Router } from "express";
import {
  createPermission,
  createRole,
  createRolePermission,
  createUserRole,
  getPermissions,
  getRoles,
} from "../controllers/role-permissions";
import checkPermission from "../middleware/check-permission";
import { authMiddleware } from "../middleware/auth";

export const roleMenuPermissionRoutes: Router = Router();

roleMenuPermissionRoutes.get("/roles", [
  authMiddleware,
  checkPermission("GET_ROLE"),
  asyncHandler(getRoles),
]);

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

roleMenuPermissionRoutes.get("/permissions", [
  authMiddleware,
  checkPermission("GET_PERMISSION"),
  asyncHandler(getPermissions),
]);

roleMenuPermissionRoutes.post("/:roleId/permissions", [
  authMiddleware,
  checkPermission("CREATE_PERMISSION"),
  asyncHandler(createRolePermission),
]);


roleMenuPermissionRoutes.post("/:userId/role", [
  authMiddleware,
  checkPermission("CREATE_USER_ROLE"),
  asyncHandler(createUserRole),
]);
