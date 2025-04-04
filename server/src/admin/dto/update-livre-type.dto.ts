import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateLivreTypeDto {
  @ApiProperty({
    description: 'Name of the livre type',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Description of the livre type',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Articles related to the livre type',
    required: false,
  })
  @IsString()
  @IsOptional()
  articles?: string;
}
