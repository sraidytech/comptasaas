import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDeclarationTypeDto {
  @ApiProperty({
    description: 'Name of the declaration type',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Description of the declaration type',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Articles related to the declaration type',
    required: false,
  })
  @IsString()
  @IsOptional()
  articles?: string;
}
