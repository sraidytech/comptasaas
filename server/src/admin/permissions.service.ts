import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Permission, RolePermission } from '@prisma/client';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

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

  async findPermissionByName(name: string): Promise<Permission> {
    const permission = await this.prisma.permission.findUnique({
      where: { name },
    });

    if (!permission) {
      throw new NotFoundException(`Permission with name ${name} not found`);
    }

    return permission;
  }

  async getUserPermissions(userId: string): Promise<Permission[]> {
    // Get user with role
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Extract permissions from role
    const permissions = user.role.rolePermissions.map((rp) => rp.permission);

    return permissions;
  }

  async checkUserHasPermission(
    userId: string,
    permissionName: string,
  ): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return userPermissions.some((p) => p.name === permissionName);
  }

  async getRolePermissions(roleId: string): Promise<Permission[]> {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    return role.rolePermissions.map((rp) => rp.permission);
  }

  async assignPermissionToRole(
    roleId: string,
    permissionId: string,
  ): Promise<RolePermission> {
    // Check if role exists
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    // Check if permission exists
    const permission = await this.prisma.permission.findUnique({
      where: { id: permissionId },
    });

    if (!permission) {
      throw new NotFoundException(
        `Permission with ID ${permissionId} not found`,
      );
    }

    // Check if permission is already assigned to role
    const existingRolePermission = await this.prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
    });

    if (existingRolePermission) {
      throw new ConflictException('Permission is already assigned to role');
    }

    // Assign permission to role
    return this.prisma.rolePermission.create({
      data: {
        roleId,
        permissionId,
      },
    });
  }

  async removePermissionFromRole(
    roleId: string,
    permissionId: string,
  ): Promise<RolePermission> {
    // Check if role exists
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    // Check if permission exists
    const permission = await this.prisma.permission.findUnique({
      where: { id: permissionId },
    });

    if (!permission) {
      throw new NotFoundException(
        `Permission with ID ${permissionId} not found`,
      );
    }

    // Check if permission is assigned to role
    const existingRolePermission = await this.prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
    });

    if (!existingRolePermission) {
      throw new NotFoundException('Permission is not assigned to role');
    }

    // Remove permission from role
    return this.prisma.rolePermission.delete({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
    });
  }
}
