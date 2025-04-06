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
  Query,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { SuperAdminGuard } from './guards/super-admin.guard';
import { UsersService } from '../users/users.service';
import { CreateUserDto, UpdateUserDto } from '../users/dto';
import { User } from '../users/entities';
import { FilterUsersDto } from './dto';
import { PaginatedUsers, PaginatedUsersResponse } from '../common/interfaces/pagination.interface';
import { TenantsService } from './tenants.service';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('admin/users')
@ApiBearerAuth()
@UseGuards(SuperAdminGuard)
@Controller('admin/users')
export class AdminUsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly tenantsService: TenantsService,
    private readonly prisma: PrismaService,
  ) {}

  @ApiOperation({
    summary: 'Get all users with filtering, sorting, and pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Return paginated users',
  })
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(
    @Query() filterDto: FilterUsersDto,
  ): Promise<PaginatedUsersResponse | User[]> {
    // For backward compatibility, if no filter parameters are provided, return all users
    if (
      !filterDto.tenantId &&
      !filterDto.roleId &&
      !filterDto.isActive &&
      !filterDto.search &&
      !filterDto.sortBy &&
      !filterDto.page &&
      !filterDto.pageSize
    ) {
      return this.usersService.findAll();
    }

    // Use the new filtering functionality
    const result = await this.usersService.findAll(filterDto);

    // If the result is an array, it means we're using the old method
    if (Array.isArray(result)) {
      return result;
    }

    // At this point, result is PaginatedUsers
    const paginatedResult = result as PaginatedUsers;
    
    // Calculate total pages
    const totalPages = Math.ceil(paginatedResult.total / (filterDto.pageSize || 10));

    // Return paginated response with all required properties
    const response: PaginatedUsersResponse = {
      users: paginatedResult.users,
      total: paginatedResult.total,
      page: filterDto.page || 0,
      pageSize: filterDto.pageSize || 10,
      totalPages,
    };

    return response;
  }

  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: 200,
    description: 'Return user by ID',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @ApiOperation({ summary: 'Create new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully created',
    type: User,
  })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    // Check if the user being created has an ADMIN role
    if (createUserDto.roleId) {
      const role = await this.prisma.role.findUnique({
        where: { id: createUserDto.roleId },
      });

      // If the role is ADMIN and no tenantId is provided, create a new tenant
      if (role?.name === 'ADMIN' && !createUserDto.tenantId) {
        try {
          // Create a new tenant with the username as the tenant name
          const tenantName = createUserDto.username || 'New Tenant';
          const tenant = await this.tenantsService.create({
            name: tenantName,
            description: `Tenant for ${createUserDto.username}`,
          });

          // Assign the new tenant ID to the user
          createUserDto.tenantId = tenant.id;
        } catch (error) {
          throw new BadRequestException(`Failed to create tenant: ${error.message}`);
        }
      }
    }

    return this.usersService.create(createUserDto);
  }

  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({
    status: 200,
    description: 'User successfully updated',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({
    status: 200,
    description: 'User successfully deleted',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<User> {
    return this.usersService.remove(id);
  }

  @ApiOperation({ summary: 'Get users by tenant ID' })
  @ApiResponse({
    status: 200,
    description: 'Return users by tenant ID',
    type: [User],
  })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @HttpCode(HttpStatus.OK)
  @Get('tenants/:tenantId/users')
  async findByTenant(@Param('tenantId') tenantId: string): Promise<User[]> {
    const result = await this.usersService.findAll(tenantId);
    if (Array.isArray(result)) {
      return result;
    }
    return result.users;
  }

  @ApiOperation({ summary: 'Change user status' })
  @ApiResponse({
    status: 200,
    description: 'User status successfully changed',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @HttpCode(HttpStatus.OK)
  @Patch(':id/status')
  async changeStatus(
    @Param('id') id: string,
    @Body() statusDto: { isActive: boolean },
  ): Promise<User> {
    return this.usersService.update(id, { isActive: statusDto.isActive });
  }

  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({
    status: 200,
    description: 'User password successfully changed',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @HttpCode(HttpStatus.OK)
  @Post(':id/change-password')
  async changePassword(
    @Param('id') id: string,
    @Body() passwordDto: { currentPassword: string; newPassword: string },
  ): Promise<void> {
    // This would typically call a method in the users service to change the password
    // For now, we'll just update the user with the new password
    await this.usersService.update(id, { password: passwordDto.newPassword });
  }
}
