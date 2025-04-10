import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTenantStatusDto {
  @ApiProperty({
    description: 'Tenant active status',
    example: true,
  })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    description: 'Admin password for confirmation',
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
