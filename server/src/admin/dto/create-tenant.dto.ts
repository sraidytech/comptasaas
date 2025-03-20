import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTenantDto {
  @ApiProperty({
    description: 'Tenant name',
    example: 'Acme Corporation',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Tenant description',
    example: 'Accounting firm specializing in small businesses',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
