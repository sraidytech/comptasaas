import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { UsersControllerModule } from './users/users-controller.module';
import { CommonModule } from './common/common.module';
import { SharedAuthModule } from './auth/shared';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    CommonModule,
    SharedAuthModule,
    AuthModule,
    UsersModule,
    UsersControllerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
