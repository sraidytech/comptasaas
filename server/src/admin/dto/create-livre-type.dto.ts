import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLivreTypeDto {
  @ApiProperty({
    description: 'Name of the livre type',
  })
  @IsString()
  name: string;

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

  @ApiProperty({
    description: 'Months associated with the livre type',
    required: false,
    type: [Number],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  @Max(12, { each: true })
  @IsOptional()
  months?: number[];
}
