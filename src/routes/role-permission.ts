import { asyncHandler } from "../exceptions/async-handler";
import { Router } from "express";
import {
  assaignUserRole,
  createOrUpdateRolePermission,
  getAssignedPermissions,
  getAssignedPermissionsById,
  getPermissionById,
  getPermissions,
  getRoleById,
  getRoles,
  getRoleWiseUserList,
  GetUserRoleById,
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
]);


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
]);

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
roleMenuPermissionRoutes.get("/assigned-roles/", [
  authMiddleware,
  asyncHandler(getRoleWiseUserList)
])


roleMenuPermissionRoutes.get("/assigned-roles/:id", [
  authMiddleware,
  asyncHandler(GetUserRoleById)
])


roleMenuPermissionRoutes.post("/assigned-roles/:id", [
  authMiddleware,
  asyncHandler(assaignUserRole)
])



