import { Global, Module } from '@nestjs/common';
import { PasswordService } from './password.service';
import { PrismaModule } from '../prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [PasswordService],
  exports: [PasswordService],
})
export class CommonModule {}
