// prisma/seed.ts
import prisma  from '../src/connect';
import bcrypt from 'bcrypt';

async function main() {
  // Add/Update few initial permissions on DB
  const permissions = [
    { name: "CREATE_USER" },
    { name: "UPDATE_USER" },
    { name: "GET_USER" },
    { name: "DELETE_USER" },
    { name: "CREATE_ROLE" },
    { name: "UPDATE_ROLE" },
    { name: "GET_ROLE" },
    { name: "DELETE_ROLE" },
    { name: "CREATE_PERMISSION" },
    { name: "UPDATE_PERMISSION" },
    { name: "GET_PERMISSION" },
    { name: "DELETE_PERMISSION" },
    { name: "ASSIGN_PERMISSION" },
    { name: "UPDATE_ASSIGN_PERMISSION" },
    { name: "ASSIGN_ROLE" },
    { name: "UPDATE_ASSIGN_ROLE" },
  ];

  // Upsert Permissions
  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: { name: perm.name },
    });
  }

  // Fetch all permissions
  const allPermissions = await prisma.permission.findMany();

  // Upsert Admin Role
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: { name: 'Admin' },
  });

  // Payload for RolePermissions
  const adminRolePermissions = allPermissions.map((perm) => ({
    roleId: adminRole.id,
    permissionId: perm.id,
  }));

  // Delete existing RolePermissions for Admin to prevent duplicates
  await prisma.rolePermission.deleteMany({
    where: { roleId: adminRole.id },
  });

  // Create RolePermissions
  await prisma.rolePermission.createMany({
    data: adminRolePermissions,
  });

  // Optionally, create an Admin User
  const adminEmail = 'admin@example.com';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('password123', 10);

    const newAdmin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        Role: {
          connect: {
            id: adminRole.id,
          },
        },
      },
    });

    console.log('Admin user created:', newAdmin.email);
  } else {
    console.log('Admin user already exists.');
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
