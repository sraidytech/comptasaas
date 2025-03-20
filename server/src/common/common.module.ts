import { Global, Module } from '@nestjs/common';
import { PasswordService } from './password.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TenantIsolationMiddleware } from './middleware';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '15m',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [PasswordService, TenantIsolationMiddleware],
  exports: [PasswordService, TenantIsolationMiddleware, JwtModule],
})
export class CommonModule {}
