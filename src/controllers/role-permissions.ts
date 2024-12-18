import { Request, Response } from "express";
import prisma from "../connect";
import { HTTPSuccessResponse } from "../helpers/success-response";
import { ErrorCode, HTTPException } from "../exceptions/root";
import { NotFoundException } from "../exceptions/not-found";
import { BadRequestException } from "../exceptions/bad-request";



// Role Management
export const getRoles = async (req: Request, res: Response) => {
  const role = await prisma.role.findMany();

  const response = new HTTPSuccessResponse(
    "Role created successfully",
    201,
    role
  );
  res.status(response.statusCode).json(response);

  if (!role) {
    throw new NotFoundException("Role not found", ErrorCode.ROLE_NOT_FOUND);
  }
};

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


export const getPermissions = async (req: Request, res: Response) => {
  const role = await prisma.permission.findMany();

  const response = new HTTPSuccessResponse(
    "Role created successfully",
    201,
    role
  );
  res.status(response.statusCode).json(response);

  if (!role) {
    throw new NotFoundException("Role not found", ErrorCode.ROLE_NOT_FOUND);
  }
};

// Role Permission
export const createRolePermission = async (req: Request, res: Response) => {
  const { permissionIds } = req.body;
  const { roleId } = req.params;

  // Check if role exist
  const role = await prisma.role.findUnique({
    where: {
      id: +roleId,
    },
  });

  if (!role) {
    throw new NotFoundException("Role not found", ErrorCode.ROLE_NOT_FOUND);
  }

  // Check if permissions exist
  const permissions = await prisma.permission.findMany({
    where: {
      id: {
        in: permissionIds,
      },
    },
  });

  if (permissions.length !== permissionIds.length) {
    throw new BadRequestException(
      "Some permissions are invalid",
      ErrorCode.ROLE_NOT_FOUND
    );
  }

  // Check if role permission mappings already exist
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
      "Some permissions are already assigned to the role",
      ErrorCode.ROLE_NOT_FOUND
    );
  }

  // Create role permission mappings
  const rolePermission = permissionIds.map((permissionId: number) => ({
    roleId: role.id,
    permissionId: permissionId,
  }));

  await prisma.rolePermission.createMany({
    data: rolePermission,
  });

  const response = new HTTPSuccessResponse(
    "Role permission created successfully",
    201,
    rolePermission
  );
  res.status(response.statusCode).json(response);
};

// User Role
export const createUserRole = async (req: Request, res: Response) => {
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

  // Check if role exist
  const role = await prisma.role.findUnique({
    where: {
      id: +roleId,
    },
  });

  if (!role) {
    throw new NotFoundException("Role not found", ErrorCode.ROLE_NOT_FOUND);
  }

  // Check if role assignment already exists
  if (user?.roleId === role?.id) {
    throw new BadRequestException(
      "Role already assigned to user",
      ErrorCode.BAD_REQUEST
    );
  }

  const newRoleAssignment = await prisma.user.update({
    where: {
      id: +userId,
    },
    data: {
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
