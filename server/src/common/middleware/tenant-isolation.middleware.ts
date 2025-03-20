import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  tenantId?: string;
}

interface RequestWithTenant extends Request {
  tenantId?: string;
  userId?: string;
  userRole?: string;
}

@Injectable()
export class TenantIsolationMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}

  use(req: RequestWithTenant, res: Response, next: NextFunction): void {
    // Skip tenant isolation for auth routes
    if (req.path.startsWith('/auth')) {
      return next();
    }

    // Skip tenant isolation for super admin routes
    if (req.path.startsWith('/admin')) {
      return next();
    }

    // Get the authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return next();
    }

    try {
      // Extract the token
      const token = authHeader.split(' ')[1];
      const decoded = this.jwtService.verify<JwtPayload>(token);

      // Check if the user has a tenant
      if (!decoded.tenantId) {
        // Super admins might not have a tenant, so we allow them to proceed
        if (decoded.role === 'SUPER_ADMIN') {
          return next();
        }
        throw new ForbiddenException('User does not have a tenant');
      }

      // Check if the requested tenant matches the user's tenant
      const requestedTenantId =
        req.params.tenantId || (req.query.tenantId as string);
      if (requestedTenantId && requestedTenantId !== decoded.tenantId) {
        // Only allow super admins to access other tenants
        if (decoded.role !== 'SUPER_ADMIN') {
          throw new ForbiddenException('Access to this tenant is forbidden');
        }
      }

      // Add the tenant ID to the request for use in controllers
      req.tenantId = decoded.tenantId;
      req.userId = decoded.sub;
      req.userRole = decoded.role;

      next();
    } catch {
      // If token verification fails, just proceed (auth guard will handle it)
      next();
    }
  }
}
