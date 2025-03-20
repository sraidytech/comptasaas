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
} from '@nestjs/swagger';
import { SuperAdminGuard } from './guards/super-admin.guard';
import { AdminService } from './admin.service';
import { TenantsService } from './tenants.service';
import { CreateTenantDto, UpdateTenantDto } from './dto';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(SuperAdminGuard)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly tenantsService: TenantsService,
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
}
