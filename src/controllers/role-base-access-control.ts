import { Request, Response } from "express";
import prisma from "../connect";
import { HTTPSuccessResponse } from "../helpers/success-response";

// Role Management
export const createRole = async (req: Request, res: Response) => {
  const { name } = req.body;


  console.log('name', name);

  const role = await prisma.role.create({
    data: {
      name
    }
  });

  const response = new HTTPSuccessResponse(
    "Role created successfully",
    201,
    role
  );
  res.status(response.statusCode).json(response);
};

// Permission Management
export const createPermission = async (req: Request, res: Response) => {
  const { name } = req.body;

  const role = await prisma.permission.create({
    data: {
      name,
    },
  });

  const response = new HTTPSuccessResponse(
    "Permission created successfully",
    201,
    role
  );
  res.status(response.statusCode).json(response);
};

// Role Permission
export const createRolePermission = async (req: Request, res: Response) => {
  const { permissionIds } = req.body;

  const role = await prisma.role.findUnique({
    where: {
      id: +req.params.roleId,
    },
  });

  if (!role) {
    throw new Error("Role not found");
  }

  const permissions = await prisma.permission.findMany({
    where: {
      id: {
        in: permissionIds,
      },
    },
  });

  if (permissions.length !== permissionIds.length) {
    throw new Error("Permission not found");
  }

  const rolePermission = await prisma.rolePermission.createMany({
    data: permissionIds.map((permissionId: number) => ({
      roleId: role.id,
      permissionId: permissionId,
    })),
  });

  const response = new HTTPSuccessResponse(
    "Role permission created successfully",
    201,
    rolePermission
  );
  res.status(response.statusCode).json(response);
};

// Role Assignment
export const createRoleAssignment = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const {  roleId } = req.body;

  const existingRoleAssignment = await prisma.userRole.findFirst({
    where: {
      userId: +userId,
      roleId: +roleId,
    },
  });

  if (existingRoleAssignment) {
    throw new Error("Role already assigned to user");
  }

  const newRoleAssignment = await prisma.userRole.create({
    data: {
      userId: +userId,
      roleId: +roleId,
    },
  });

  const response = new HTTPSuccessResponse(
    "Role assignment created successfully",
    201,
    newRoleAssignment
  );
  res.status(response.statusCode).json(response);
};
