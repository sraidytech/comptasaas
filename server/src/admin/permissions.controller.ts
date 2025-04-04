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

  @ApiOperation({ summary: 'Get all permissions' })
  @ApiResponse({
    status: 200,
    description: 'Return all permissions',
  })
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(): Promise<Permission[]> {
    return this.permissionsService.findAllPermissions();
  }
}
