import { ApiProperty } from '@nestjs/swagger';

export class User {
  @ApiProperty({
    description: 'User ID',
  })
  id: string;

  @ApiProperty({
    description: 'User tenant ID',
    required: false,
    nullable: true,
  })
  tenantId: string | null;

  @ApiProperty({
    description: 'User role ID',
  })
  roleId: string;

  @ApiProperty({
    description: 'Username',
  })
  username: string;

  @ApiProperty({
    description: 'User email address',
  })
  email: string;

  @ApiProperty({
    description: 'User password (hashed)',
  })
  password: string;

  @ApiProperty({
    description: 'User profile image URL',
    required: false,
    nullable: true,
  })
  imageUrl: string | null;

  @ApiProperty({
    description: 'User active status',
  })
  isActive: boolean;

  @ApiProperty({
    description: 'User last login date',
    required: false,
    nullable: true,
  })
  lastLogin: Date | null;

  @ApiProperty({
    description: 'User creation date',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'User last update date',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'User role',
  })
  role?: {
    id: string;
    name: string;
    description: string | null;
  };
}
