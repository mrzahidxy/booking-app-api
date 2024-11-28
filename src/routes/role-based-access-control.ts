import { Router } from "express";
import { createPermission, createRole, createRoleAssignment, createRolePermission } from "../controllers/role-base-access-control";


export const roleMenuPermissionRoutes: Router = Router();


roleMenuPermissionRoutes.post('/roles', createRole);
roleMenuPermissionRoutes.post('/permissions', createPermission);
roleMenuPermissionRoutes.post('/:roleId/permissions', createRolePermission);
roleMenuPermissionRoutes.post('/:userId/role', createRoleAssignment);
