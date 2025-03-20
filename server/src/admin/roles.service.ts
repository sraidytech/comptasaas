import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, Permission } from '@prisma/client';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async findAllRoles(): Promise<Role[]> {
    return this.prisma.role.findMany({
      include: {
        _count: {
          select: {
            users: true,
            rolePermissions: true,
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
