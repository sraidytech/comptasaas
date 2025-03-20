import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { TenantsService } from './tenants.service';
import { PermissionsService } from './permissions.service';
import { RolesService } from './roles.service';
import { DeclarationTypesService } from './declaration-types.service';
import { LivreTypesService } from './livre-types.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SuperAdminGuard } from './guards/super-admin.guard';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AdminController],
  providers: [
    AdminService,
    TenantsService,
    PermissionsService,
    RolesService,
    DeclarationTypesService,
    LivreTypesService,
    SuperAdminGuard,
  ],
  exports: [
    AdminService,
    TenantsService,
    PermissionsService,
    RolesService,
    DeclarationTypesService,
    LivreTypesService,
    SuperAdminGuard,
  ],
})
export class AdminModule {}
