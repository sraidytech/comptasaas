import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Adding permissions to the database...');

  // Create permissions
  const permissions = [
    // User Management Permissions
    {
      name: 'user:create',
      description: 'Create new users',
      category: 'USER_MANAGEMENT',
    },
    {
      name: 'user:read',
      description: 'View user details',
      category: 'USER_MANAGEMENT',
    },
    {
      name: 'user:update',
      description: 'Update user details',
      category: 'USER_MANAGEMENT',
    },
    {
      name: 'user:delete',
      description: 'Delete users',
      category: 'USER_MANAGEMENT',
    },

    // Client Management Permissions
    {
      name: 'client:create',
      description: 'Create new client records',
      category: 'CLIENT_MANAGEMENT',
    },
    {
      name: 'client:read',
      description: 'View client records',
      category: 'CLIENT_MANAGEMENT',
    },
    {
      name: 'client:update',
      description: 'Update client records',
      category: 'CLIENT_MANAGEMENT',
    },
    {
      name: 'client:delete',
      description: 'Delete client records',
      category: 'CLIENT_MANAGEMENT',
    },

    // Declaration Management Permissions
    {
      name: 'declaration-type:create',
      description: 'Create declaration types',
      category: 'DECLARATION_MANAGEMENT',
    },
    {
      name: 'declaration-type:read',
      description: 'View declaration types',
      category: 'DECLARATION_MANAGEMENT',
    },
    {
      name: 'declaration-type:update',
      description: 'Update declaration types',
      category: 'DECLARATION_MANAGEMENT',
    },
    {
      name: 'declaration-type:delete',
      description: 'Delete declaration types',
      category: 'DECLARATION_MANAGEMENT',
    },
    {
      name: 'declaration:create',
      description: 'Create declarations',
      category: 'DECLARATION_MANAGEMENT',
    },
    {
      name: 'declaration:read',
      description: 'View declarations',
      category: 'DECLARATION_MANAGEMENT',
    },
    {
      name: 'declaration:update',
      description: 'Update declarations',
      category: 'DECLARATION_MANAGEMENT',
    },
    {
      name: 'declaration:delete',
      description: 'Delete declarations',
      category: 'DECLARATION_MANAGEMENT',
    },

    // Livre Management Permissions
    {
      name: 'livre-type:create',
      description: 'Create livre types',
      category: 'LIVRE_MANAGEMENT',
    },
    {
      name: 'livre-type:read',
      description: 'View livre types',
      category: 'LIVRE_MANAGEMENT',
    },
    {
      name: 'livre-type:update',
      description: 'Update livre types',
      category: 'LIVRE_MANAGEMENT',
    },
    {
      name: 'livre-type:delete',
      description: 'Delete livre types',
      category: 'LIVRE_MANAGEMENT',
    },
    {
      name: 'livre:create',
      description: 'Create livres',
      category: 'LIVRE_MANAGEMENT',
    },
    {
      name: 'livre:read',
      description: 'View livres',
      category: 'LIVRE_MANAGEMENT',
    },
    {
      name: 'livre:update',
      description: 'Update livres',
      category: 'LIVRE_MANAGEMENT',
    },
    {
      name: 'livre:delete',
      description: 'Delete livres',
      category: 'LIVRE_MANAGEMENT',
    },

    // System Configuration Permissions
    {
      name: 'system:manage-settings',
      description: 'Manage system settings',
      category: 'SYSTEM_CONFIGURATION',
    },
    {
      name: 'system:manage-tenants',
      description: 'Manage tenants',
      category: 'SYSTEM_CONFIGURATION',
    },
    {
      name: 'system:manage-roles',
      description: 'Manage roles',
      category: 'SYSTEM_CONFIGURATION',
    },
  ];

  // Create all permissions
  for (const permissionData of permissions) {
    try {
      const permission = await prisma.permission.create({
        data: {
          name: permissionData.name,
          description: permissionData.description,
        },
      });
      console.log(`Created permission: ${permission.name}`);
    } catch (error) {
      console.error(`Error creating permission ${permissionData.name}:`, error);
    }
  }

  // Get all roles
  const roles = await prisma.role.findMany();

  // Get all permissions
  const allPermissions = await prisma.permission.findMany();

  // Assign all permissions to SUPER_ADMIN role
  const superAdminRole = roles.find((role) => role.name === 'SUPER_ADMIN');
  if (superAdminRole) {
    for (const permission of allPermissions) {
      try {
        await prisma.rolePermission.create({
          data: {
            roleId: superAdminRole.id,
            permissionId: permission.id,
          },
        });
      } catch (error) {
        // Ignore duplicate key errors
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (!errorMessage.includes('Unique constraint failed')) {
          console.error(
            `Error assigning permission ${permission.name} to SUPER_ADMIN role:`,
            error,
          );
        }
      }
    }
    console.log('Assigned all permissions to SUPER_ADMIN role');
  }

  console.log('Permissions added successfully!');
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
