import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const permissions = [
  // User management
  "GET_USER",
  "UPDATE_USER",
  // Role & permission reads/assignments
  "GET_ROLE",
  "GET_PERMISSION",
  "GET_ASSIGNED_PERMISSION",
  "ASSIGN_PERMISSION",
  "ASSIGN_ROLE",
  // Domain management
  "MANAGE_HOTEL",
  "MANAGE_RESTAURANT",
  "MANAGE_BOOKING",
];

const roles = [
  { name: "Admin", permissions },
  {
    name: "Staff",
    permissions: [
      "GET_USER",
      "UPDATE_USER",
      "GET_ROLE",
      "GET_PERMISSION",
      "GET_ASSIGNED_PERMISSION",
      "ASSIGN_PERMISSION",
      "ASSIGN_ROLE",
      "MANAGE_HOTEL",
      "MANAGE_RESTAURANT",
      "MANAGE_BOOKING",
    ],
  },
  {
    name: "User",
    permissions: [
      // keep empty; access is driven by auth-only endpoints
    ],
  },
];

async function createDefaultPermissions() {
  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission },
      update: {},
      create: { name: permission },
    });
  }
}

async function createDefaultRoles() {
  for (const role of roles) {
    const rolePermissions = await prisma.permission.findMany({
      where: {
        name: {
          in: role.permissions,
        },
      },
    });

    await prisma.role.upsert({
      where: { name: role.name },
      update: {}, // No need to update if role already exists
      create: {
        name: role.name,
        rolePermission: {
          createMany: {
            data: rolePermissions.map((permission) => ({
              permissionId: permission.id,
            })),
            skipDuplicates: true, // This will skip duplicate permission entries for the role
          },
        },
      },
    });

  }
}

// Create default Admin user
async function createAdminUser() {
  const adminRole = await prisma.role.findUnique({
    where: { name: 'Admin' },
  });

  const hashedPassword = await bcrypt.hash('Password@123', 10); // Default password for admin

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
      roleId: adminRole?.id, // Assign the Admin role
    },
  });
}

async function main() {
  await createDefaultPermissions();
  await createDefaultRoles();
  await createAdminUser();
  console.log('Default permissions, roles, and admin user created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
