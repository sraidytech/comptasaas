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
  UnauthorizedException,
  BadRequestException,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { SuperAdminGuard } from './guards/super-admin.guard';
import { AdminService } from './admin.service';
import { TenantsService } from './tenants.service';
import { 
  CreateTenantDto, 
  UpdateTenantDto, 
  UpdateTenantStatusDto,
  UpdateTenantSubscriptionDto 
} from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordService } from '../common/password.service';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(SuperAdminGuard)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly tenantsService: TenantsService,
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
  ) {}

  @ApiOperation({ summary: 'Get admin dashboard statistics' })
  @ApiResponse({
    status: 200,
    description: 'Return dashboard statistics',
  })
  @HttpCode(HttpStatus.OK)
  @Get('dashboard')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @ApiOperation({ summary: 'Get system health' })
  @ApiResponse({
    status: 200,
    description: 'Return system health status',
  })
  @HttpCode(HttpStatus.OK)
  @Get('health')
  async getSystemHealth() {
    return this.adminService.getSystemHealth();
  }

  // Tenant management endpoints
  @ApiOperation({ summary: 'Get all tenants' })
  @ApiResponse({
    status: 200,
    description: 'Return all tenants',
  })
  @HttpCode(HttpStatus.OK)
  @Get('tenants')
  async findAllTenants() {
    return this.tenantsService.findAll();
  }

  @ApiOperation({ summary: 'Get tenant by ID' })
  @ApiResponse({
    status: 200,
    description: 'Return tenant by ID',
  })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  @ApiParam({ name: 'id', description: 'Tenant ID' })
  @HttpCode(HttpStatus.OK)
  @Get('tenants/:id')
  async findOneTenant(@Param('id') id: string) {
    return this.tenantsService.findOne(id);
  }

  @ApiOperation({ summary: 'Create new tenant' })
  @ApiResponse({
    status: 201,
    description: 'Tenant successfully created',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('tenants')
  async createTenant(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantsService.create(createTenantDto);
  }

  @ApiOperation({ summary: 'Update tenant' })
  @ApiResponse({
    status: 200,
    description: 'Tenant successfully updated',
  })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  @ApiParam({ name: 'id', description: 'Tenant ID' })
  @HttpCode(HttpStatus.OK)
  @Patch('tenants/:id')
  async updateTenant(
    @Param('id') id: string,
    @Body() updateTenantDto: UpdateTenantDto,
  ) {
    return this.tenantsService.update(id, updateTenantDto);
  }

  @ApiOperation({ summary: 'Delete tenant' })
  @ApiResponse({
    status: 200,
    description: 'Tenant successfully deleted',
  })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  @ApiParam({ name: 'id', description: 'Tenant ID' })
  @HttpCode(HttpStatus.OK)
  @Delete('tenants/:id')
  async removeTenant(@Param('id') id: string) {
    return this.tenantsService.remove(id);
  }

  @ApiOperation({ summary: 'Get tenant statistics' })
  @ApiResponse({
    status: 200,
    description: 'Return tenant statistics',
  })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  @ApiParam({ name: 'id', description: 'Tenant ID' })
  @HttpCode(HttpStatus.OK)
  @Get('tenants/:id/stats')
  async getTenantStats(@Param('id') id: string) {
    return this.tenantsService.getTenantStats(id);
  }

  @ApiOperation({ summary: 'Update tenant status' })
  @ApiResponse({
    status: 200,
    description: 'Tenant status successfully updated',
  })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  @ApiResponse({ status: 401, description: 'Invalid password' })
  @ApiParam({ name: 'id', description: 'Tenant ID' })
  @HttpCode(HttpStatus.OK)
  @Patch('tenants/:id/status')
  async updateTenantStatus(
    @Param('id') id: string,
    @Body() statusDto: UpdateTenantStatusDto,
    @Request() req: any,
  ) {
    // Get the current user (super admin)
    // The user ID is in req.user.sub, not req.user.userId
    const userId = req.user?.sub;
    
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify the password
    const isPasswordValid = await this.passwordService.compare(
      statusDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    // If we're deactivating a tenant, make sure it's not a critical one
    if (!statusDto.isActive) {
      // Check if this tenant has any SUPER_ADMIN users
      const hasSuperAdmins = await this.prisma.user.findFirst({
        where: {
          tenantId: id,
          role: {
            name: 'SUPER_ADMIN',
          },
        },
      });

      if (hasSuperAdmins) {
        throw new BadRequestException('Cannot deactivate a tenant with SUPER_ADMIN users');
      }
    }

    // Update the tenant status
    return this.tenantsService.update(id, { isActive: statusDto.isActive });
  }

  @ApiOperation({ summary: 'Update tenant subscription' })
  @ApiResponse({
    status: 200,
    description: 'Tenant subscription successfully updated',
  })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  @ApiResponse({ status: 401, description: 'Invalid password' })
  @ApiParam({ name: 'id', description: 'Tenant ID' })
  @HttpCode(HttpStatus.OK)
  @Patch('tenants/:id/subscription')
  async updateTenantSubscription(
    @Param('id') id: string,
    @Body() subscriptionDto: UpdateTenantSubscriptionDto,
    @Request() req: any,
  ) {
    // Get the current user (super admin)
    const userId = req.user?.sub;
    
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify the password
    const isPasswordValid = await this.passwordService.compare(
      subscriptionDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Mot de passe invalide');
    }

    // Update the tenant subscription
    return this.tenantsService.updateSubscription(id, subscriptionDto);
  }
}
