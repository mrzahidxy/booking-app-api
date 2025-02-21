import { Request, Response } from "express";
import prisma from "../connect";
import { HTTPSuccessResponse } from "../helpers/success-response";
import { ErrorCode, HTTPException } from "../exceptions/root";
import { NotFoundException } from "../exceptions/not-found";
import { BadRequestException } from "../exceptions/bad-request";
import { formatPaginationResponse } from "../utils/common-method";



// Role Management
export const getRoles = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  // Fetch roles with pagination
  const roles = await prisma.role.findMany({ skip, take: limit });
  const totalRoles = await prisma.role.count();

  if (!roles || roles.length === 0) {
    throw new NotFoundException("No roles found", ErrorCode.ROLE_NOT_FOUND);
  }

  const formattedResponse = formatPaginationResponse(roles, totalRoles, page, limit);

  const response = new HTTPSuccessResponse(
    "Roles fetched successfully",
    200,
    formattedResponse
  );
  return res.status(response.statusCode).json(response);

};

export const getRoleById = async (req: Request, res: Response) => {
  const { roleId } = req.params;

  const role = await prisma.role.findUnique({
    where: {
      id: +roleId,
    },
  });

  console.log("role", role);

  if (!role) {
    throw new NotFoundException("Role not found", ErrorCode.ROLE_NOT_FOUND);
  }

  const response = new HTTPSuccessResponse(
    "Role fetched successfully",
    200,
    role

  )
  return res.status(response.statusCode).json(response);
}

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

export const updateRole = async (req: Request, res: Response) => {
  const { roleId } = req.params;
  const { name } = req.body;

  const role = await prisma.role.update({
    where: {
      id: +roleId,
    },
    data: {
      name: name,
    }
  }
  );

  const response = new HTTPSuccessResponse(
    "Role updated successfully",
    200,
    role
  );
  res.status(response.statusCode).json(response);
};

export const deleteRole = async (req: Request, res: Response) => {
  const { roleId } = req.params;

  const role = await prisma.role.delete({
    where: {
      id: +roleId,
    },
  });

  const response = new HTTPSuccessResponse(
    "Role deleted successfully",
    200,
    role
  );
  res.status(response.statusCode).json(response);
}

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
