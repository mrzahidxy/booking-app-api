import { asyncHandler } from "../exceptions/async-handler";
import { Router } from "express";
import {
  createPermission,
  createRole,
  createRolePermission,
  createUserRole,
  deletePermission,
  deleteRole,
  getPermissionById,
  getPermissions,
  getRoleById,
  getRoles,
  updatePermission,
  updateRole,
} from "../controllers/role-permissions";
import checkPermission from "../middleware/check-permission";
import { authMiddleware } from "../middleware/auth";

export const roleMenuPermissionRoutes: Router = Router();

roleMenuPermissionRoutes.get("/roles", [
  authMiddleware,
  checkPermission("GET_ROLE"),
  asyncHandler(getRoles),
]);

roleMenuPermissionRoutes.get("/roles/:roleId", [
  authMiddleware,
  checkPermission("GET_ROLE"),
  asyncHandler(getRoleById),
])

roleMenuPermissionRoutes.post("/roles", [
  authMiddleware,
  checkPermission("CREATE_ROLE"),
  asyncHandler(createRole),
]);

roleMenuPermissionRoutes.put("/roles/:roleId", [
  authMiddleware,
  checkPermission("UPDATE_ROLE"),
  asyncHandler(updateRole),
])

roleMenuPermissionRoutes.delete("/roles/:roleId", [
  authMiddleware,
  checkPermission("DELETE_ROLE"),
  asyncHandler(deleteRole),
])


// Permissions

roleMenuPermissionRoutes.get("/permissions", [
  authMiddleware,
  checkPermission("GET_PERMISSION"),
  asyncHandler(getPermissions),
]);

roleMenuPermissionRoutes.get("/permissions/:id", [
  authMiddleware,
  checkPermission("GET_PERMISSION"),
  asyncHandler(getPermissionById),
])

roleMenuPermissionRoutes.post("/permissions", [
  authMiddleware,
  checkPermission("CREATE_PERMISSION"),
  asyncHandler(createPermission),
]);

roleMenuPermissionRoutes.put("/permissions/:id", [
  authMiddleware,
  checkPermission("UPDATE_PERMISSION"),
  asyncHandler(updatePermission),
])

roleMenuPermissionRoutes.delete("/permissions/:id", [
  authMiddleware,
  checkPermission("DELETE_PERMISSION"),
  asyncHandler(deletePermission),
])


