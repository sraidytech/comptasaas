import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { UsersControllerModule } from './users/users-controller.module';
import { CommonModule } from './common/common.module';
import { SharedAuthModule } from './auth/shared';
import { TenantIsolationMiddleware } from './common';
import { ClientsModule } from './clients/clients.module';
import { AdminModule } from './admin/admin.module';
import { AttachmentsModule } from './attachments/attachments.module';

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
    ClientsModule,
    AdminModule,
    AttachmentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantIsolationMiddleware).forRoutes('*');
  }
}
