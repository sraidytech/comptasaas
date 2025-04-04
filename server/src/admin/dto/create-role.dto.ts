import { IsString, IsOptional, IsArray, ArrayUnique } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({
    description: 'Name of the role',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Description of the role',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'IDs of permissions to assign to the role',
    required: false,
    type: [String],
  })
  @IsArray()
  @ArrayUnique()
  @IsOptional()
  permissionIds?: string[];
}
