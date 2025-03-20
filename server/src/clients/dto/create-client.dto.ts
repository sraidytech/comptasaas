import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ClientType } from '@prisma/client';

export class CreateClientDto {
  @ApiProperty({
    description: 'Client name',
    example: 'Acme Corporation',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Client email',
    example: 'contact@acme.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Client phone',
    example: '+212 555-1234',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'Client type',
    enum: ClientType,
    example: 'PERSONNE_MORALE',
  })
  @IsEnum(ClientType)
  @IsNotEmpty()
  type: ClientType;

  @ApiProperty({
    description: 'Tenant ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  tenantId: string;

  @ApiProperty({
    description: 'Client ICE (Identifiant Commun de l\'Entreprise)',
    example: '001234567890123',
    required: false,
  })
  @IsString()
  @IsOptional()
  ice?: string;

  @ApiProperty({
    description: 'Client IF (Identifiant Fiscal)',
    example: '12345678',
    required: false,
  })
  @IsString()
  @IsOptional()
  if?: string;

  @ApiProperty({
    description: 'Client DGI login',
    example: 'acme_dgi',
    required: false,
  })
  @IsString()
  @IsOptional()
  loginDGI?: string;

  @ApiProperty({
    description: 'Client DGI password',
    example: 'password123',
    required: false,
  })
  @IsString()
  @IsOptional()
  passwordDGI?: string;

  @ApiProperty({
    description: 'Client DAMNCOM login',
    example: 'acme_damncom',
    required: false,
  })
  @IsString()
  @IsOptional()
  loginDAMNCOM?: string;

  @ApiProperty({
    description: 'Client DAMNCOM password',
    example: 'password123',
    required: false,
  })
  @IsString()
  @IsOptional()
  passwordDAMNCOM?: string;
}
