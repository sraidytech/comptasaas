/* eslint-disable */
import {
  Controller,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SuperAdminGuard } from './guards/super-admin.guard';
import { PermissionsService } from './permissions.service';
import { Permission } from '@prisma/client';

@ApiTags('admin/permissions')
@ApiBearerAuth()
@UseGuards(SuperAdminGuard)
@Controller('admin/permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @ApiOperation({ summary: 'Get all permissions with roles' })
  @ApiResponse({
    status: 200,
    description: 'Return all permissions with their associated roles',
  })
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(): Promise<any[]> {
    const permissions = await this.permissionsService.findAllPermissions();
    
    // For each permission, get the roles that have this permission
    const permissionsWithRoles = await Promise.all(
      permissions.map(async (permission) => {
        const roles = await this.permissionsService.getRolesWithPermission(permission.id);
        return {
          ...permission,
          roles: roles.map(role => ({
            id: role.id,
            name: role.name,
          })),
        };
      })
    );
    
    return permissionsWithRoles;
  }
}
