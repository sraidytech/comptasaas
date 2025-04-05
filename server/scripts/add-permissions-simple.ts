/* eslint-disable */
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
    },
    {
      name: 'user:read',
      description: 'View user details',
    },
    {
      name: 'user:update',
      description: 'Update user details',
    },
    {
      name: 'user:delete',
      description: 'Delete users',
    },

    // Client Management Permissions
    {
      name: 'client:create',
      description: 'Create new client records',
    },
    {
      name: 'client:read',
      description: 'View client records',
    },
    {
      name: 'client:update',
      description: 'Update client records',
    },
    {
      name: 'client:delete',
      description: 'Delete client records',
    },

    // Declaration Management Permissions
    {
      name: 'declaration-type:create',
      description: 'Create declaration types',
    },
    {
      name: 'declaration-type:read',
      description: 'View declaration types',
    },
    {
      name: 'declaration-type:update',
      description: 'Update declaration types',
    },
    {
      name: 'declaration-type:delete',
      description: 'Delete declaration types',
    },
    {
      name: 'declaration:create',
      description: 'Create declarations',
    },
    {
      name: 'declaration:read',
      description: 'View declarations',
    },
    {
      name: 'declaration:update',
      description: 'Update declarations',
    },
    {
      name: 'declaration:delete',
      description: 'Delete declarations',
    },

    // Livre Management Permissions
    {
      name: 'livre-type:create',
      description: 'Create livre types',
    },
    {
      name: 'livre-type:read',
      description: 'View livre types',
    },
    {
      name: 'livre-type:update',
      description: 'Update livre types',
    },
    {
      name: 'livre-type:delete',
      description: 'Delete livre types',
    },
    {
      name: 'livre:create',
      description: 'Create livres',
    },
    {
      name: 'livre:read',
      description: 'View livres',
    },
    {
      name: 'livre:update',
      description: 'Update livres',
    },
    {
      name: 'livre:delete',
      description: 'Delete livres',
    },

    // System Configuration Permissions
    {
      name: 'system:manage-settings',
      description: 'Manage system settings',
    },
    {
      name: 'system:manage-tenants',
      description: 'Manage tenants',
    },
    {
      name: 'system:manage-roles',
      description: 'Manage roles',
    },
  ];

  // Create all permissions directly
  for (const permissionData of permissions) {
    try {
      // Create new permission directly without checking if it exists
      const permission = await prisma.permission.create({
        data: {
          name: permissionData.name,
          description: permissionData.description,
        },
      });
      console.log(`Created permission: ${permission.name}`);
    } catch (error) {
      // If the permission already exists, ignore the error
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Unique constraint failed')) {
        console.log(`Permission ${permissionData.name} already exists`);
      } else {
        console.error(`Error creating permission ${permissionData.name}:`, error);
      }
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
        console.log(`Assigned permission ${permission.name} to SUPER_ADMIN role`);
      } catch (error) {
        // Ignore duplicate key errors
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (!errorMessage.includes('Unique constraint failed')) {
          console.error(
            `Error assigning permission ${permission.name} to SUPER_ADMIN role:`,
            error,
          );
        } else {
          console.log(`Permission ${permission.name} already assigned to SUPER_ADMIN role`);
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
