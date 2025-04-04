import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { TenantsService } from './tenants.service';
import { PermissionsService } from './permissions.service';
import { RolesService } from './roles.service';
import { DeclarationTypesService } from './declaration-types.service';
import { DeclarationTypesController } from './declaration-types.controller';
import { LivreTypesService } from './livre-types.service';
import { LivreTypesController } from './livre-types.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SuperAdminGuard } from './guards/super-admin.guard';
import { AdminUsersController } from './users.controller';
import { RolesController } from './roles.controller';
import { PermissionsController } from './permissions.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [
    AdminController,
    DeclarationTypesController,
    LivreTypesController,
    AdminUsersController,
    RolesController,
    PermissionsController,
  ],
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
