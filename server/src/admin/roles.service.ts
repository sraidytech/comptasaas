/* eslint-disable */
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, Permission } from '@prisma/client';
import { CreateRoleDto, UpdateRoleDto } from './dto';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async createRole(createRoleDto: CreateRoleDto): Promise<Role> {
    console.log('RolesService.createRole called with:', JSON.stringify(createRoleDto, null, 2));
    
    try {
      // Check if a role with the same name already exists
      const existingRole = await this.prisma.role.findUnique({
        where: { name: createRoleDto.name },
      });

      if (existingRole) {
        throw new ConflictException(
          `Role with name ${createRoleDto.name} already exists`,
        );
      }

      // Use a transaction to ensure both role creation and permission assignments happen atomically
      return await this.prisma.$transaction(async (prisma) => {
        console.log('Starting transaction for role creation with permissions');
        
        // Create the role without permissions first
        const role = await prisma.role.create({
          data: {
            name: createRoleDto.name,
            description: createRoleDto.description,
          },
        });
        
        console.log('Role created in transaction:', role);
        
        // Add permissions if provided
        if (createRoleDto.permissionIds && createRoleDto.permissionIds.length > 0) {
          console.log('Adding permissions to role in transaction:', createRoleDto.permissionIds);
          
          // Verify all permissions exist
          const permissions = await prisma.permission.findMany({
            where: {
              id: {
                in: createRoleDto.permissionIds
              }
            }
          });
          
          console.log(`Found ${permissions.length} valid permissions out of ${createRoleDto.permissionIds.length} requested`);
          
          // Get valid permission IDs
          const validPermissionIds = permissions.map(p => p.id);
          
          // Create role permissions in bulk
          const rolePermissionsData = validPermissionIds.map(permissionId => ({
            roleId: role.id,
            permissionId
          }));
          
          // Create all role permissions at once
          await prisma.rolePermission.createMany({
            data: rolePermissionsData,
            skipDuplicates: true
          });
          
          console.log(`Added ${validPermissionIds.length} permissions to role ${role.id} in transaction`);
        }
        
        // Fetch the complete role with permissions to return
        const completeRole = await prisma.role.findUnique({
          where: { id: role.id },
          include: {
            rolePermissions: {
              include: {
                permission: true
              }
            }
          }
        });
        
        if (!completeRole) {
          throw new Error(`Role with ID ${role.id} not found after creation`);
        }
        
        console.log(`Transaction completed successfully for role creation ${role.id}`);
        
        return completeRole;
      });
    } catch (error) {
      console.error('Error in createRole:', error);
      throw error;
    }
  }

  async findAllRoles(): Promise<Role[]> {
    return this.prisma.role.findMany({
      include: {
        _count: {
          select: {
            users: true,
            rolePermissions: true,
          },
        },
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async findRoleById(id: string): Promise<Role> {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            rolePermissions: true,
          },
        },
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return role;
  }

  async findRoleByName(name: string): Promise<Role | null> {
    return this.prisma.role.findUnique({
      where: { name },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async updateRole(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    console.log('RolesService.updateRole called with:', id, JSON.stringify(updateRoleDto, null, 2));
    
    try {
      // Check if role exists
      await this.findRoleById(id);

      // If name is being updated, check if it's already taken
      if (updateRoleDto.name) {
        const existingRole = await this.prisma.role.findUnique({
          where: { name: updateRoleDto.name },
        });

        if (existingRole && existingRole.id !== id) {
          throw new ConflictException(
            `Role with name ${updateRoleDto.name} already exists`,
          );
        }
      }

      // Use a transaction to ensure both role update and permission assignments happen atomically
      return await this.prisma.$transaction(async (prisma) => {
        console.log('Starting transaction for role update with permissions');
        
        // Prepare the base role data
        const roleData: any = {
          name: updateRoleDto.name,
          description: updateRoleDto.description,
        };
        
        // Update the role
        const updatedRole = await prisma.role.update({
          where: { id },
          data: roleData,
        });
        
        console.log('Role updated in transaction:', updatedRole);
        
        // If permissionIds are provided, update the role's permissions
        if (updateRoleDto.permissionIds && updateRoleDto.permissionIds.length > 0) {
          console.log('Updating role permissions in transaction:', updateRoleDto.permissionIds);
          
          // First, delete all existing role permissions
          await prisma.rolePermission.deleteMany({
            where: { roleId: id },
          });
          
          // Verify all permissions exist
          const permissions = await prisma.permission.findMany({
            where: {
              id: {
                in: updateRoleDto.permissionIds
              }
            }
          });
          
          console.log(`Found ${permissions.length} valid permissions out of ${updateRoleDto.permissionIds.length} requested`);
          
          // Get valid permission IDs
          const validPermissionIds = permissions.map(p => p.id);
          
          // Create role permissions in bulk
          const rolePermissionsData = validPermissionIds.map(permissionId => ({
            roleId: id,
            permissionId
          }));
          
          // Create all role permissions at once
          await prisma.rolePermission.createMany({
            data: rolePermissionsData,
            skipDuplicates: true
          });
          
          console.log(`Added ${validPermissionIds.length} permissions to role ${id} in transaction`);
        }
        
        // Fetch the complete role with permissions to return
        const completeRole = await prisma.role.findUnique({
          where: { id },
          include: {
            rolePermissions: {
              include: {
                permission: true
              }
            }
          }
        });
        
        if (!completeRole) {
          throw new Error(`Role with ID ${id} not found after update`);
        }
        
        console.log(`Transaction completed successfully for role update ${id}`);
        
        return completeRole;
      });
    } catch (error) {
      console.error('Error in updateRole:', error);
      throw error;
    }
  }

  async deleteRole(id: string): Promise<Role> {
    try {
      // Check if role exists
      await this.findRoleById(id);

      // Check if the role is assigned to any users
      const usersWithRole = await this.prisma.user.count({
        where: { roleId: id },
      });

      if (usersWithRole > 0) {
        throw new ConflictException(
          `Cannot delete role with ID ${id} because it is assigned to ${usersWithRole} users`,
        );
      }

      // Use a transaction to ensure both role deletion and permission deletions happen atomically
      return await this.prisma.$transaction(async (prisma) => {
        console.log('Starting transaction for role deletion');
        
        // First, delete all role permissions
        await prisma.rolePermission.deleteMany({
          where: { roleId: id },
        });
        
        console.log(`Deleted all permissions for role ${id} in transaction`);
        
        // Then delete the role
        const deletedRole = await prisma.role.delete({
          where: { id },
        });
        
        console.log(`Deleted role ${id} in transaction`);
        console.log(`Transaction completed successfully for role deletion ${id}`);
        
        return deletedRole;
      });
    } catch (error) {
      console.error('Error in deleteRole:', error);
      throw error;
    }
  }

  async findAllPermissions(): Promise<Permission[]> {
    return this.prisma.permission.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findPermissionById(id: string): Promise<Permission> {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }

    return permission;
  }

  async getRolePermissions(roleId: string): Promise<Permission[]> {
    // Check if role exists
    await this.findRoleById(roleId);

    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: { roleId },
      include: {
        permission: true,
      },
    });

    return rolePermissions.map((rp) => rp.permission);
  }

  async assignPermissionToRole(
    roleId: string,
    permissionId: string,
  ): Promise<void> {
    // Check if role exists
    await this.findRoleById(roleId);

    // Check if permission exists
    await this.findPermissionById(permissionId);

    // Check if the permission is already assigned to the role
    const existingRolePermission = await this.prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
    });

    if (existingRolePermission) {
      throw new ConflictException(
        'Permission is already assigned to this role',
      );
    }

    await this.prisma.rolePermission.create({
      data: {
        roleId,
        permissionId,
      },
    });
  }

  async removePermissionFromRole(
    roleId: string,
    permissionId: string,
  ): Promise<void> {
    // Check if role exists
    await this.findRoleById(roleId);

    // Check if permission exists
    await this.findPermissionById(permissionId);

    // Check if the permission is assigned to the role
    const existingRolePermission = await this.prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
    });

    if (!existingRolePermission) {
      throw new NotFoundException('Permission is not assigned to this role');
    }

    await this.prisma.rolePermission.delete({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
    });
  }
}
