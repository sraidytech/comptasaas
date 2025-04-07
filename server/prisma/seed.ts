import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create roles
  const superAdminRole = await prisma.role.create({
    data: {
      name: 'SUPER_ADMIN',
      description: 'Super administrator role with unrestricted access across all tenants',
    },
  });

  console.log('Created super admin role:', superAdminRole);

  const adminRole = await prisma.role.create({
    data: {
      name: 'ADMIN',
      description: 'Administrator role with full access within a tenant',
    },
  });

  console.log('Created admin role:', adminRole);

  const employeeRole = await prisma.role.create({
    data: {
      name: 'EMPLOYEE',
      description: 'Regular employee with limited access',
    },
  });

  console.log('Created employee role:', employeeRole);

  // Create tenants
  const defaultTenant = await prisma.tenant.create({
    data: {
      name: 'Default Tenant',
      description: 'Default tenant for testing',
    },
  });

  console.log('Created default tenant:', defaultTenant);

  const secondTenant = await prisma.tenant.create({
    data: {
      name: 'Second Tenant',
      description: 'Second tenant for testing multi-tenant functionality',
    },
  });

  console.log('Created second tenant:', secondTenant);

  // Hash the passwords
  const hashedPassword = await bcrypt.hash('SracomConnect@2025Sr', 10);

  // Create a super admin user (without tenant)
  const superAdminUser = await prisma.user.create({
    data: {
      username: 'sracomconnect',
      email: 'sracomconnect@gmail.com',
      password: hashedPassword,
      roleId: superAdminRole.id,
      // No tenantId for super admin as they have access across all tenants
    },
  });

  console.log('Created super admin user:', superAdminUser);

  // Create an admin user for the default tenant
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      roleId: adminRole.id,
      tenantId: defaultTenant.id,
    },
  });

  console.log('Created admin user:', adminUser);

  // Create an employee user for the default tenant
  const employeeUser = await prisma.user.create({
    data: {
      username: 'employee',
      email: 'employee@example.com',
      password: hashedPassword,
      roleId: employeeRole.id,
      tenantId: defaultTenant.id,
    },
  });

  console.log('Created employee user:', employeeUser);

  // Create an admin user for the second tenant
  const secondTenantAdmin = await prisma.user.create({
    data: {
      username: 'admin2',
      email: 'admin2@example.com',
      password: hashedPassword,
      roleId: adminRole.id,
      tenantId: secondTenant.id,
    },
  });

  console.log('Created second tenant admin user:', secondTenantAdmin);
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
