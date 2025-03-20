import {
  Controller,
  Post,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Body,
} from '@nestjs/common';
import { AuthService, LoginResponse, TokenResponse } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { User } from '../users/entities';
import { RegisterDto, RefreshTokenDto } from './dto';

// Define a type that matches what the LocalAuthGuard provides
type AuthenticatedUser = {
  id: string;
  email: string;
  username: string;
  role: {
    id: string;
    name: string;
  };
  roleId: string;
  tenantId?: string;
  imageUrl?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
};

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: 200,
    description: 'Returns JWT token and user information',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Request() req: { user: AuthenticatedUser }): LoginResponse {
    // The user object from LocalAuthGuard matches what AuthService.login expects
    return this.authService.login(
      req.user as unknown as Omit<User, 'password'>,
    );
  }

  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
  })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists',
  })
  @ApiBody({ type: RegisterDto })
  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<LoginResponse> {
    return this.authService.register(registerDto);
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Returns new access and refresh tokens',
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  @ApiBody({ type: RefreshTokenDto })
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<TokenResponse> {
    return this.authService.refreshToken(refreshTokenDto.refresh_token);
  }
}
