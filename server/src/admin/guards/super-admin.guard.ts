import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { Request } from 'express';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  tenantId?: string;
}

interface RequestWithUser extends Request {
  user?: JwtPayload;
}

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Authentication token is missing');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: process.env.JWT_SECRET,
      });

      // Attach user to request
      request.user = payload;

      // Check if user exists and is a super admin
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { role: true },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (user.role.name !== 'SUPER_ADMIN') {
        throw new UnauthorizedException('Requires super admin privileges');
      }

      return true;
    } catch {
      throw new UnauthorizedException(
        'Invalid token or insufficient permissions',
      );
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
