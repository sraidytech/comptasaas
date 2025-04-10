/* eslint-disable */
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordService } from '../common/password.service';
import { User } from '../users/entities';
import { Tenant } from '../admin/entities';
import { RegisterDto } from './dto/register.dto';

export interface JwtPayload {
  email: string;
  sub: string;
  role: string;
  tenantId?: string | null;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
}

export interface LoginResponse extends TokenResponse {
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
    tenantId?: string | null;
  };
}

export interface RefreshTokenPayload {
  sub: string;
  refreshToken: string;
}

interface UserWithRole {
  id: string;
  email: string;
  username: string;
  tenantId?: string | null;
  role?: {
    id: string;
    name: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private passwordService: PasswordService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user's tenant is active (skip for SUPER_ADMIN)
    const isSuperAdmin = user.role?.name === 'SUPER_ADMIN';
    if (!isSuperAdmin && user.tenantId) {
      const tenant = (await this.prisma.tenant.findUnique({
        where: { id: user.tenantId },
      })) as Tenant | null;

      if (!tenant?.isActive) {
        throw new UnauthorizedException('Tenant account is inactive');
      }
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    const isPasswordValid = await this.passwordService.compare(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login timestamp
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;
    return result;
  }

  async register(registerDto: RegisterDto): Promise<LoginResponse> {
    // Check if user with email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Get default role (EMPLOYEE)
    const defaultRole = await this.prisma.role.findFirst({
      where: { name: 'EMPLOYEE' },
    });

    if (!defaultRole) {
      // Create EMPLOYEE role if it doesn't exist
      const newRole = await this.prisma.role.create({
        data: {
          name: 'EMPLOYEE',
          description: 'Regular employee with limited access',
        },
      });

      // Hash password
      const hashedPassword = await this.passwordService.hash(
        registerDto.password,
      );

      // Create user with new role
      const user = await this.prisma.user.create({
        data: {
          email: registerDto.email,
          username: registerDto.username,
          password: hashedPassword,
          roleId: newRole.id,
          tenantId: registerDto.tenantId,
        },
        include: { role: true },
      });

      return this.generateLoginResponse(user);
    }

    // Hash password
    const hashedPassword = await this.passwordService.hash(
      registerDto.password,
    );

    // Create user with default role
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        username: registerDto.username,
        password: hashedPassword,
        roleId: defaultRole.id,
        tenantId: registerDto.tenantId,
      },
      include: { role: true },
    });

    return this.generateLoginResponse(user);
  }

  login(user: Omit<User, 'password'>): LoginResponse {
    return this.generateLoginResponse(user as UserWithRole);
  }

  private generateLoginResponse(user: UserWithRole): LoginResponse {
    const roleName = user.role?.name || 'user';
    const payload: JwtPayload = {
      email: user.email,
      sub: user.id,
      role: roleName,
      tenantId: user.tenantId,
    };

    const refreshPayload: RefreshTokenPayload = {
      sub: user.id,
      refreshToken: this.generateRefreshToken(),
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(refreshPayload, {
      expiresIn: '7d',
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: roleName,
        tenantId: user.tenantId,
      },
    };
  }

  private generateRefreshToken(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    try {
      const decoded = this.jwtService.verify<RefreshTokenPayload>(refreshToken);
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.sub },
        include: { role: true },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new UnauthorizedException('User account is inactive');
      }

      // Check if user's tenant is active (skip for SUPER_ADMIN)
      const isSuperAdmin = user.role?.name === 'SUPER_ADMIN';
      if (!isSuperAdmin && user.tenantId) {
        const tenant = (await this.prisma.tenant.findUnique({
          where: { id: user.tenantId },
        })) as Tenant | null;

        if (!tenant?.isActive) {
          throw new UnauthorizedException('Tenant account is inactive');
        }
      }

      // Update last login timestamp
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });

      const roleName = user.role?.name || 'user';
      const payload: JwtPayload = {
        email: user.email,
        sub: user.id,
        role: roleName,
        tenantId: user.tenantId,
      };

      const refreshPayload: RefreshTokenPayload = {
        sub: user.id,
        refreshToken: this.generateRefreshToken(),
      };

      const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
      const newRefreshToken = this.jwtService.sign(refreshPayload, {
        expiresIn: '7d',
      });

      return {
        access_token: accessToken,
        refresh_token: newRefreshToken,
      };
    } catch (error) {
      console.error('Refresh token error:', error);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
