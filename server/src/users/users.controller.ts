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
  Query,
  HttpCode,
  HttpStatus,
  Request,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/shared/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateUserDto, UpdateUserDto } from './dto';
import { User } from './entities';
import { PaginatedUsersResponse } from '../common/interfaces/pagination.interface';
import { PrismaService } from '../prisma/prisma.service';

interface RequestWithUser extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
    tenantId?: string;
  };
}

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
  ) {}

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
  async findAll(@Query('tenantId') tenantId?: string, @Request() req?: RequestWithUser): Promise<User[]> {
    // If user is not a SUPER_ADMIN, they can only see users from their tenant
    if (req?.user?.role !== 'SUPER_ADMIN' && req?.user?.tenantId) {
      tenantId = req.user.tenantId;
    }
    
    const result = await this.usersService.findAll(tenantId);
    
    // If the result is an array, return it directly
    if (Array.isArray(result)) {
      return result;
    }
    
    // If the result is a PaginatedUsersResponse, extract the users array
    return result.users;
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
  async findOne(@Param('id') id: string, @Request() req?: RequestWithUser): Promise<User> {
    const user = await this.usersService.findOne(id);
    
    // If user is not a SUPER_ADMIN, they can only see users from their tenant
    if (req?.user?.role !== 'SUPER_ADMIN' && req?.user?.tenantId !== user.tenantId) {
      throw new ForbiddenException('You do not have permission to access this user');
    }
    
    return user;
  }

  @ApiOperation({ summary: 'Create new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully created',
    type: User,
  })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Body() createUserDto: CreateUserDto, @Request() req?: RequestWithUser): Promise<User> {
    // Check if the user is authorized to create users
    if (!req?.user) {
      throw new UnauthorizedException('User not authenticated');
    }
    
    // If the user is not a SUPER_ADMIN, they can only create users in their tenant
    if (req.user.role !== 'SUPER_ADMIN') {
      // Check if the user is an ADMIN
      const userRole = await this.prisma.role.findUnique({
        where: { id: req.user.userId },
      });
      
      if (userRole?.name !== 'ADMIN') {
        throw new ForbiddenException('Only ADMIN users can create new users');
      }
      
      // Force the tenantId to be the same as the admin's tenantId
      createUserDto.tenantId = req.user.tenantId;
      
      // Check if the role is valid for a tenant admin to assign
      if (createUserDto.roleId) {
        const role = await this.prisma.role.findUnique({
          where: { id: createUserDto.roleId },
        });
        
        // Tenant admins cannot create SUPER_ADMIN or ADMIN users
        if (role?.name === 'SUPER_ADMIN' || role?.name === 'ADMIN') {
          throw new ForbiddenException('You do not have permission to create users with this role');
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
    @Request() req?: RequestWithUser,
  ): Promise<User> {
    // Check if the user is authorized to update users
    if (!req?.user) {
      throw new UnauthorizedException('User not authenticated');
    }
    
    // Get the user to be updated
    const userToUpdate = await this.usersService.findOne(id);
    
    // If the user is not a SUPER_ADMIN, they can only update users in their tenant
    if (req.user.role !== 'SUPER_ADMIN') {
      // Check if the user is an ADMIN
      const userRole = await this.prisma.role.findUnique({
        where: { id: req.user.userId },
      });
      
      if (userRole?.name !== 'ADMIN') {
        throw new ForbiddenException('Only ADMIN users can update users');
      }
      
      // Check if the user to update is in the same tenant
      if (userToUpdate.tenantId !== req.user.tenantId) {
        throw new ForbiddenException('You do not have permission to update this user');
      }
      
      // Prevent changing the tenantId
      if (updateUserDto.tenantId && updateUserDto.tenantId !== req.user.tenantId) {
        throw new ForbiddenException('You cannot change the tenant of a user');
      }
      
      // Check if the role is valid for a tenant admin to assign
      if (updateUserDto.roleId) {
        const role = await this.prisma.role.findUnique({
          where: { id: updateUserDto.roleId },
        });
        
        // Tenant admins cannot assign SUPER_ADMIN or ADMIN roles
        if (role?.name === 'SUPER_ADMIN' || role?.name === 'ADMIN') {
          throw new ForbiddenException('You do not have permission to assign this role');
        }
      }
    }
    
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
  async remove(@Param('id') id: string, @Request() req?: RequestWithUser): Promise<User> {
    // Check if the user is authorized to delete users
    if (!req?.user) {
      throw new UnauthorizedException('User not authenticated');
    }
    
    // Get the user to be deleted
    const userToDelete = await this.usersService.findOne(id);
    
    // If the user is not a SUPER_ADMIN, they can only delete users in their tenant
    if (req.user.role !== 'SUPER_ADMIN') {
      // Check if the user is an ADMIN
      const userRole = await this.prisma.role.findUnique({
        where: { id: req.user.userId },
      });
      
      if (userRole?.name !== 'ADMIN') {
        throw new ForbiddenException('Only ADMIN users can delete users');
      }
      
      // Check if the user to delete is in the same tenant
      if (userToDelete.tenantId !== req.user.tenantId) {
        throw new ForbiddenException('You do not have permission to delete this user');
      }
      
      // Prevent deleting ADMIN users
      const roleToDelete = await this.prisma.role.findUnique({
        where: { id: userToDelete.roleId },
      });
      
      if (roleToDelete?.name === 'ADMIN') {
        throw new ForbiddenException('You do not have permission to delete ADMIN users');
      }
    }
    
    return this.usersService.remove(id);
  }
}
