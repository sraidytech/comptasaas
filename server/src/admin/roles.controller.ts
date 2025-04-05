/* eslint-disable */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { SuperAdminGuard } from './guards/super-admin.guard';
import { RolesService } from './roles.service';
import { Role, Permission } from '@prisma/client';
import { CreateRoleDto, UpdateRoleDto } from './dto';

class PermissionIdsDto {
  permissionIds: string[];
}

interface PermissionError {
  permissionId: string;
  errorMessage: string;
}

@ApiTags('admin/roles')
@ApiBearerAuth()
@UseGuards(SuperAdminGuard)
@Controller('admin/roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({
    status: 200,
    description: 'Return all roles',
  })
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(): Promise<any[]> {
    const roles = await this.rolesService.findAllRoles();
    
    // Map roles to include permissions directly
    const rolesWithPermissions = roles.map((role: any) => {
      // Extract permissions from rolePermissions
      const permissions = role.rolePermissions?.map((rp: any) => rp.permission) || [];
      
      console.log(`Role ${role.name} has ${permissions.length} permissions:`, 
        permissions.map((p: any) => p.name).join(', '));
      
      // Return role with permissions and count
      return {
        id: role.id,
        name: role.name,
        description: role.description,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
        _count: role._count,
        permissions: permissions,
        permissionCount: permissions.length
      };
    });
    
    return rolesWithPermissions;
  }

  @ApiOperation({ summary: 'Get role by ID' })
  @ApiResponse({
    status: 200,
    description: 'Return role by ID',
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Role> {
    return this.rolesService.findRoleById(id);
  }

  @ApiOperation({ summary: 'Create new role' })
  @ApiResponse({
    status: 201,
    description: 'Role successfully created',
  })
  @ApiBody({ type: CreateRoleDto })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Body() createRoleDto: CreateRoleDto): Promise<Role> {
    try {
      console.log('Creating role with data:', JSON.stringify(createRoleDto, null, 2));
      console.log('permissionIds type:', typeof createRoleDto.permissionIds);
      console.log('permissionIds value:', createRoleDto.permissionIds);
      console.log('permissionIds length:', createRoleDto.permissionIds?.length);

      // Create the role with permissions in one go
      const role = await this.rolesService.createRole(createRoleDto);
      console.log('Created role with permissions:', JSON.stringify(role, null, 2));
      
      return role;
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  }

  @ApiOperation({ summary: 'Update role' })
  @ApiResponse({
    status: 200,
    description: 'Role successfully updated',
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiBody({ type: UpdateRoleDto })
  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<Role> {
    try {
      console.log('Updating role with ID:', id, 'Data:', JSON.stringify(updateRoleDto, null, 2));

      // Update the role with all data including permissionIds
      // The service will handle updating the role and its permissions in a transaction
      const updatedRole = await this.rolesService.updateRole(id, updateRoleDto);
      console.log('Updated role with all data:', updatedRole);

      // Return the updated role with permissions
      const finalRole = await this.rolesService.findRoleById(id);
      console.log('Final updated role:', JSON.stringify(finalRole, null, 2));
      return finalRole;
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  }

  @ApiOperation({ summary: 'Delete role' })
  @ApiResponse({
    status: 200,
    description: 'Role successfully deleted',
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 409, description: 'Role is assigned to users' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Role> {
    try {
      console.log('Deleting role with ID:', id);

      // Delete the role
      const deletedRole = await this.rolesService.deleteRole(id);
      console.log('Deleted role:', deletedRole);

      return deletedRole;
    } catch (error) {
      console.error('Error deleting role:', error);
      throw error;
    }
  }

  @ApiOperation({ summary: 'Get all permissions' })
  @ApiResponse({
    status: 200,
    description: 'Return all permissions',
  })
  @HttpCode(HttpStatus.OK)
  @Get('permissions')
  async findAllPermissions(): Promise<Permission[]> {
    return this.rolesService.findAllPermissions();
  }

  @ApiOperation({ summary: 'Get role permissions' })
  @ApiResponse({
    status: 200,
    description: 'Return role permissions',
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @HttpCode(HttpStatus.OK)
  @Get(':id/permissions')
  async getRolePermissions(@Param('id') id: string): Promise<Permission[]> {
    return this.rolesService.getRolePermissions(id);
  }

  @ApiOperation({ summary: 'Add permissions to role' })
  @ApiResponse({
    status: 200,
    description: 'Permissions successfully added to role',
  })
  @ApiResponse({ status: 404, description: 'Role or permission not found' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiBody({ type: PermissionIdsDto })
  @HttpCode(HttpStatus.OK)
  @Post(':id/permissions')
  async addPermissions(
    @Param('id') id: string,
    @Body() permissionIdsDto: PermissionIdsDto,
  ): Promise<Role> {
    try {
      console.log(
        `Adding permissions to role ${id}:`,
        permissionIdsDto.permissionIds,
      );

      // Add each permission to the role
      const errors: PermissionError[] = [];
      for (const permissionId of permissionIdsDto.permissionIds) {
        try {
          await this.rolesService.assignPermissionToRole(id, permissionId);
        } catch (error) {
          console.error(
            `Error adding permission ${permissionId} to role ${id}:`,
            error,
          );
          errors.push({
            permissionId,
            errorMessage:
              error instanceof Error ? error.message : String(error),
          });
          // Continue with other permissions even if one fails
        }
      }

      // Log errors if any
      if (errors.length > 0) {
        console.warn(
          `Failed to add ${errors.length} permissions to role ${id}:`,
          errors,
        );
      }

      // Return the updated role
      return this.rolesService.findRoleById(id);
    } catch (error) {
      console.error(`Error adding permissions to role ${id}:`, error);
      throw error;
    }
  }

  @ApiOperation({ summary: 'Remove permissions from role' })
  @ApiResponse({
    status: 200,
    description: 'Permissions successfully removed from role',
  })
  @ApiResponse({ status: 404, description: 'Role or permission not found' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiBody({ type: PermissionIdsDto })
  @HttpCode(HttpStatus.OK)
  @Delete(':id/permissions')
  async removePermissions(
    @Param('id') id: string,
    @Body() permissionIdsDto: PermissionIdsDto,
  ): Promise<Role> {
    try {
      console.log(
        `Removing permissions from role ${id}:`,
        permissionIdsDto.permissionIds,
      );

      // Remove each permission from the role
      const errors: PermissionError[] = [];
      for (const permissionId of permissionIdsDto.permissionIds) {
        try {
          await this.rolesService.removePermissionFromRole(id, permissionId);
        } catch (error) {
          console.error(
            `Error removing permission ${permissionId} from role ${id}:`,
            error,
          );
          errors.push({
            permissionId,
            errorMessage:
              error instanceof Error ? error.message : String(error),
          });
          // Continue with other permissions even if one fails
        }
      }

      // Log errors if any
      if (errors.length > 0) {
        console.warn(
          `Failed to remove ${errors.length} permissions from role ${id}:`,
          errors,
        );
      }

      // Return the updated role
      return this.rolesService.findRoleById(id);
    } catch (error) {
      console.error(`Error removing permissions from role ${id}:`, error);
      throw error;
    }
  }
}
