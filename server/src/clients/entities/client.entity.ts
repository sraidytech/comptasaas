import { ApiProperty } from '@nestjs/swagger';
import { ClientType } from '@prisma/client';

export class Client {
  @ApiProperty({
    description: 'Client ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Tenant ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  tenantId: string;

  @ApiProperty({
    description: 'Client name',
    example: 'Acme Corporation',
  })
  name: string;

  @ApiProperty({
    description: 'Client email',
    example: 'contact@acme.com',
    required: false,
    nullable: true,
  })
  email: string | null;

  @ApiProperty({
    description: 'Client phone',
    example: '+212 555-1234',
    required: false,
    nullable: true,
  })
  phone: string | null;

  @ApiProperty({
    description: 'Client type',
    enum: ClientType,
    example: 'PERSONNE_MORALE',
  })
  type: ClientType;

  @ApiProperty({
    description: 'Client active status',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: "Client ICE (Identifiant Commun de l'Entreprise)",
    example: '001234567890123',
    required: false,
    nullable: true,
  })
  ice: string | null;

  @ApiProperty({
    description: 'Client IF (Identifiant Fiscal)',
    example: '12345678',
    required: false,
    nullable: true,
  })
  if: string | null;

  @ApiProperty({
    description: 'Client DGI login',
    example: 'acme_dgi',
    required: false,
    nullable: true,
  })
  loginDGI: string | null;

  @ApiProperty({
    description: 'Client DGI password',
    example: 'password123',
    required: false,
    nullable: true,
  })
  passwordDGI: string | null;

  @ApiProperty({
    description: 'Client DAMNCOM login',
    example: 'acme_damncom',
    required: false,
    nullable: true,
  })
  loginDAMNCOM: string | null;

  @ApiProperty({
    description: 'Client DAMNCOM password',
    example: 'password123',
    required: false,
    nullable: true,
  })
  passwordDAMNCOM: string | null;

  @ApiProperty({
    description: 'Creation date',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2023-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}
