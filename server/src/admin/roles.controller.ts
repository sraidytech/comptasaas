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
  async findAll(): Promise<Role[]> {
    return this.rolesService.findAllRoles();
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
      console.log('Creating role with data:', createRoleDto);

      // Create the role
      const role = await this.rolesService.createRole(createRoleDto);
      console.log('Created role:', role);

      // If permissionIds are provided, add them to the role
      if (
        createRoleDto.permissionIds &&
        createRoleDto.permissionIds.length > 0
      ) {
        console.log('Adding permissions to role:', createRoleDto.permissionIds);

        // Add each permission to the role
        for (const permissionId of createRoleDto.permissionIds) {
          try {
            await this.rolesService.assignPermissionToRole(
              role.id,
              permissionId,
            );
          } catch (error) {
            console.error(`Error adding permission ${permissionId}:`, error);
            // Continue with other permissions even if one fails
          }
        }

        // Return the updated role with permissions
        return this.rolesService.findRoleById(role.id);
      }

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
      console.log('Updating role with ID:', id, 'Data:', updateRoleDto);

      // Update the role
      const updatedRole = await this.rolesService.updateRole(id, updateRoleDto);
      console.log('Updated role:', updatedRole);

      // If permissionIds are provided, update the role's permissions
      if (
        updateRoleDto.permissionIds &&
        updateRoleDto.permissionIds.length > 0
      ) {
        console.log('Updating role permissions:', updateRoleDto.permissionIds);

        // Get current permissions
        const currentPermissions =
          await this.rolesService.getRolePermissions(id);
        const currentPermissionIds = currentPermissions.map((p) => p.id);

        // Remove permissions that are not in the new list
        for (const permissionId of currentPermissionIds) {
          if (!updateRoleDto.permissionIds.includes(permissionId)) {
            await this.rolesService.removePermissionFromRole(id, permissionId);
          }
        }

        // Add new permissions
        for (const permissionId of updateRoleDto.permissionIds) {
          if (!currentPermissionIds.includes(permissionId)) {
            try {
              await this.rolesService.assignPermissionToRole(id, permissionId);
            } catch (error) {
              console.error(`Error adding permission ${permissionId}:`, error);
              // Continue with other permissions even if one fails
            }
          }
        }

        // Return the updated role with permissions
        return this.rolesService.findRoleById(id);
      }

      return updatedRole;
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
