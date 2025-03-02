import { asyncHandler } from "../exceptions/async-handler";
import { Router } from "express";
import {
  createOrUpdateRolePermission,
  createPermission,
  createRole,
  createUserRole,
  deletePermission,
  deleteRole,
  getAssignedPermissions,
  getAssignedPermissionsById,
  getPermissionById,
  getPermissions,
  getRoleById,
  getRoles,
  updatePermission,
  updateRole
} from "../controllers/role-permissions";
import checkPermission from "../middleware/check-permission";
import { authMiddleware } from "../middleware/auth";

export const roleMenuPermissionRoutes: Router = Router();

roleMenuPermissionRoutes.get("/roles", [
  authMiddleware,
  checkPermission("GET_ROLE"),
  asyncHandler(getRoles),
]);

roleMenuPermissionRoutes.get("/roles/:id", [
  authMiddleware,
  checkPermission("GET_ROLE"),
  asyncHandler(getRoleById),
])

roleMenuPermissionRoutes.post("/roles", [
  authMiddleware,
  checkPermission("CREATE_ROLE"),
  asyncHandler(createRole),
]);

roleMenuPermissionRoutes.put("/roles/:id", [
  authMiddleware,
  checkPermission("UPDATE_ROLE"),
  asyncHandler(updateRole),
])

roleMenuPermissionRoutes.delete("/roles/:id", [
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

// Assign Permission to Role
roleMenuPermissionRoutes.get("/assigned-permissions/",
  authMiddleware,
  checkPermission("GET_ASSIGNED_PERMISSION"),
  asyncHandler(getAssignedPermissions)
)

roleMenuPermissionRoutes.get("/assigned-permissions/:id",
  authMiddleware,
  checkPermission("GET_ASSIGNED_PERMISSION"),
  asyncHandler(getAssignedPermissionsById)
)

roleMenuPermissionRoutes.post("/assigned-permissions/", [
  authMiddleware,
  checkPermission("ASSIGN_PERMISSION"),
  asyncHandler(createOrUpdateRolePermission),
]);

roleMenuPermissionRoutes.put("/assigned-permissions/edit", [
  authMiddleware,
  checkPermission("ASSIGN_PERMISSION"),
  asyncHandler(createOrUpdateRolePermission),
]);


// Assign Role to User
roleMenuPermissionRoutes.post("/roles/:roleId/permissions/:permissionId", [
  authMiddleware,
  // checkPermission("ASSIGN_PERMISSION"),
  asyncHandler(createUserRole),
]);


