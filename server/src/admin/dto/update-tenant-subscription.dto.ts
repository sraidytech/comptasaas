/* eslint-disable */
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsDateString,
  IsString,
  ValidateIf,
  IsNotEmpty,
} from 'class-validator';
import { SubscriptionPlan, PaymentStatus, PaymentMethod } from '../entities';

export class UpdateTenantSubscriptionDto {
  @ApiProperty({
    description: 'Tenant subscription plan',
    enum: SubscriptionPlan,
    example: SubscriptionPlan.SIX_MONTHS,
  })
  @IsEnum(SubscriptionPlan)
  subscriptionPlan: SubscriptionPlan;

  @ApiProperty({
    description: 'Tenant subscription start date',
    example: '2025-04-10T00:00:00.000Z',
  })
  @IsDateString()
  subscriptionStart: string;

  @ApiProperty({
    description: 'Tenant subscription end date',
    example: '2025-10-10T00:00:00.000Z',
  })
  @IsDateString()
  subscriptionEnd: string;

  @ApiProperty({
    description: 'Tenant payment status',
    enum: PaymentStatus,
    example: PaymentStatus.PENDING,
  })
  @IsEnum(PaymentStatus)
  paymentStatus: PaymentStatus;

  @ApiProperty({
    description: 'Tenant payment method',
    enum: PaymentMethod,
    example: PaymentMethod.BANK_TRANSFER,
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description: 'Tenant payment reference',
    example: 'BANK-TRF-123456',
    required: false,
  })
  @IsString()
  @IsOptional()
  @ValidateIf((o: any) => 
    o.paymentStatus === PaymentStatus.PAID || 
    o.paymentStatus === PaymentStatus.PENDING
  )
  @IsNotEmpty({ message: 'Payment reference is required when payment status is PAID or PENDING' })
  paymentReference?: string;

  @ApiProperty({
    description: 'Admin password for confirmation',
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
