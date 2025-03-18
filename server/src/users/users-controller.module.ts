import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersModule } from './users.module';
import { SharedAuthModule } from '../auth/shared';

@Module({
  imports: [UsersModule, SharedAuthModule],
  controllers: [UsersController],
})
export class UsersControllerModule {}
