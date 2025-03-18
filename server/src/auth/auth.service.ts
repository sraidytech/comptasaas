import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordService } from '../common/password.service';
import { User } from '../users/entities';

export interface JwtPayload {
  email: string;
  sub: string;
  role: string;
  tenantId?: string | null;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
    tenantId?: string | null;
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

    const isPasswordValid = await this.passwordService.compare(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;
    return result;
  }

  login(user: Omit<User, 'password'>): LoginResponse {
    const roleName = user.role?.name || 'user';
    const payload: JwtPayload = {
      email: user.email,
      sub: user.id,
      role: roleName,
      tenantId: user.tenantId,
    };

    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: roleName,
        tenantId: user.tenantId,
      },
    };
  }
}
