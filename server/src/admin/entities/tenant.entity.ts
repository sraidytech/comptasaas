import { ApiProperty } from '@nestjs/swagger';

export enum SubscriptionPlan {
  NONE = 'NONE',
  SIX_MONTHS = 'SIX_MONTHS',
  ONE_YEAR = 'ONE_YEAR',
}

export enum PaymentStatus {
  UNPAID = 'UNPAID',
  PENDING = 'PENDING',
  PAID = 'PAID',
  EXPIRED = 'EXPIRED',
}

export enum PaymentMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
}

export class Tenant {
  @ApiProperty({
    description: 'Tenant ID',
  })
  id: string;

  @ApiProperty({
    description: 'Tenant name',
  })
  name: string;

  @ApiProperty({
    description: 'Tenant description',
    required: false,
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'Tenant active status',
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Tenant subscription plan',
    enum: SubscriptionPlan,
    default: SubscriptionPlan.NONE,
  })
  subscriptionPlan: SubscriptionPlan;

  @ApiProperty({
    description: 'Tenant subscription start date',
    required: false,
    nullable: true,
  })
  subscriptionStart: Date | null;

  @ApiProperty({
    description: 'Tenant subscription end date',
    required: false,
    nullable: true,
  })
  subscriptionEnd: Date | null;

  @ApiProperty({
    description: 'Tenant payment status',
    enum: PaymentStatus,
    default: PaymentStatus.UNPAID,
  })
  paymentStatus: PaymentStatus;

  @ApiProperty({
    description: 'Tenant payment method',
    enum: PaymentMethod,
    default: PaymentMethod.BANK_TRANSFER,
  })
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description: 'Tenant payment reference',
    required: false,
    nullable: true,
  })
  paymentReference: string | null;

  @ApiProperty({
    description: 'Tenant creation date',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Tenant last update date',
  })
  updatedAt: Date;
}
