import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDeclarationTypeDto {
  @ApiProperty({
    description: 'Name of the declaration type',
  })
  @IsString()
  name: string;

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

  @ApiProperty({
    description: 'Months associated with the declaration type',
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
