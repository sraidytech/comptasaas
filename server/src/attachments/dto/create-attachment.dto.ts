/* eslint-disable */
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAttachmentDto {
  @ApiProperty({
    description: 'Description of the attachment',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Declaration ID to associate the attachment with',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  declarationId?: string;

  @ApiProperty({
    description: 'Livre ID to associate the attachment with',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  livreId?: string;
}
