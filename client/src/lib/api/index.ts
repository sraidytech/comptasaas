// Export API client
export { apiClient } from './api-client';

// Export API services
export { tenantsApi } from './tenants';
export { usersApi } from './users';
export { rolesApi } from './roles';
export { declarationTypesApi } from './declaration-types';
export { livreTypesApi } from './livre-types';

// Export interfaces
export type { Tenant, CreateTenantDto, UpdateTenantDto } from './tenants';
export type { 
  User, 
  CreateUserDto, 
  UpdateUserDto, 
  ChangePasswordDto, 
  UpdateStatusDto 
} from './users';
export type { 
  Role, 
  Permission, 
  CreateRoleDto, 
  UpdateRoleDto 
} from './roles';
export type { 
  DeclarationType, 
  DeclarationMonth, 
  CreateDeclarationTypeDto, 
  UpdateDeclarationTypeDto 
} from './declaration-types';
export type { 
  LivreType, 
  LivreMonth, 
  CreateLivreTypeDto, 
  UpdateLivreTypeDto 
} from './livre-types';
