import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create a role
  const adminRole = await prisma.role.create({
    data: {
      name: 'ADMIN',
      description: 'Administrator role with full access',
    },
  });

  console.log('Created admin role:', adminRole);

  // Create a tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Default Tenant',
      description: 'Default tenant for testing',
    },
  });

  console.log('Created tenant:', tenant);

  // Hash the password
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create an admin user
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      roleId: adminRole.id,
      tenantId: tenant.id,
    },
  });

  console.log('Created admin user:', adminUser);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    prisma.$disconnect();
  });
