import { Request, Response } from "express";
import prisma from "../connect";
import { HTTPSuccessResponse } from "../helpers/success-response";
import { ErrorCode, HTTPException } from "../exceptions/root";
import { NotFoundException } from "../exceptions/not-found";
import { BadRequestException } from "../exceptions/bad-request";

// Role Management
export const createRole = async (req: Request, res: Response) => {
  const { name } = req.body;

  // Check if role already exists
  const existingRole = await prisma.role.findUnique({
    where: { name },
  });

  if (existingRole) {
    throw new HTTPException(
      "Role already exists",
      ErrorCode.ROLE_ALREADY_EXISTS,
      400,
      null
    );
  }

  const role = await prisma.role.create({
    data: {
      name,
    },
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

  const existingPermission = await prisma.permission.findFirst({
    where: {
      name,
    },
  });

  if (existingPermission) {
    throw new HTTPException(
      "Permission already exists",
      ErrorCode.ADDRESS_NOT_FOUND,
      400,
      null
    );
  }

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
export const assignRolePermission = async (req: Request, res: Response) => {
  const { permissionIds } = req.body;

  const role = await prisma.role.findUnique({
    where: {
      id: +req.params.roleId,
    },
  });

  if (!role) {
    throw new NotFoundException("Role not found", ErrorCode.ROLE_NOT_FOUND);
  }

  const permissions = await prisma.permission.findMany({
    where: {
      id: {
        in: permissionIds,
      },
    },
  });

  if (permissions.length !== permissionIds.length) {
    throw new BadRequestException(
      "Already permission exists",
      ErrorCode.ROLE_NOT_FOUND
    );
  }

  const existingRolePermission = await prisma.rolePermission.findMany({
    where: {
      roleId: role.id,
      permissionId: {
        in: permissionIds,
      },
    },
  });

  if (existingRolePermission.length > 0) {
    throw new BadRequestException(
      "Already permission exists",
      ErrorCode.ROLE_NOT_FOUND
    );
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
export const assignUserRole = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { roleId } = req.body;

  // Check if user and role exist
  const user = await prisma.user.findUnique({
    where: {
      id: +userId,
    },
  });

  if (!user) {
    throw new NotFoundException("User not found", ErrorCode.USER_NOT_FOUND);
  }

  const role = await prisma.role.findUnique({
    where: {
      id: +roleId,
    },
  });

  if (!role) {
    throw new NotFoundException("Role not found", ErrorCode.ROLE_NOT_FOUND);
  }

  const existingRoleAssignment = await prisma.userRole.findFirst({
    where: {
      userId: +userId,
      roleId: +roleId,
    },
  });

  if (existingRoleAssignment) {
    throw new BadRequestException(
      "Role already assigned to user",
      ErrorCode.BAD_REQUEST
    );
  }

  const newRoleAssignment = await prisma.userRole.create({
    data: {
      userId: user.id,
      roleId: role.id,
    },
  });

  const response = new HTTPSuccessResponse(
    "Role assignment created successfully",
    201,
    newRoleAssignment
  );
  res.status(response.statusCode).json(response);
};
