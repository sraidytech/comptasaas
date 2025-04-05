/* eslint-disable */
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsUUID, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

export class FilterUsersDto {
  @ApiProperty({
    description: 'Filter users by tenant ID',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  tenantId?: string;

  @ApiProperty({
    description: 'Filter users by role ID',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  roleId?: string;

  @ApiProperty({
    description: 'Filter users by active status',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value as boolean;
  })
  isActive?: boolean;

  @ApiProperty({
    description: 'Search term for username, email',
    required: false,
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({
    description: 'Sort field',
    required: false,
    enum: [
      'username',
      'email',
      'createdAt',
      'lastLogin',
      'role.name',
      'tenant.name',
    ],
  })
  @IsString()
  @IsOptional()
  @IsIn([
    'username',
    'email',
    'createdAt',
    'lastLogin',
    'role.name',
    'tenant.name',
  ])
  sortBy?: string;

  @ApiProperty({
    description: 'Sort direction',
    required: false,
    enum: ['asc', 'desc'],
  })
  @IsString()
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortDirection?: 'asc' | 'desc';

  @ApiProperty({
    description: 'Page number (0-based)',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 0;

  @ApiProperty({
    description: 'Page size',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  pageSize?: number = 10;
}
