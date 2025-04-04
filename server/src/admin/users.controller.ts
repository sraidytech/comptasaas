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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { SuperAdminGuard } from './guards/super-admin.guard';
import { UsersService } from '../users/users.service';
import { CreateUserDto, UpdateUserDto } from '../users/dto';
import { User } from '../users/entities';

@ApiTags('admin/users')
@ApiBearerAuth()
@UseGuards(SuperAdminGuard)
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'Return all users',
    type: [User],
  })
  @ApiQuery({
    name: 'tenantId',
    required: false,
    description: 'Filter users by tenant ID',
  })
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(@Query('tenantId') tenantId?: string): Promise<User[]> {
    return this.usersService.findAll(tenantId);
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
    return this.usersService.findAll(tenantId);
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
