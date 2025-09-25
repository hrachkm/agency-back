import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

import { ThrottleExceptionGuard } from '@/shared/guards/throttle-custom.guard.ts/throttle-custom.guard';

import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { AuthService } from '../service/auth.service';
import { User } from '@/users/entities/user.entity';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('login')
  @UseGuards(AuthGuard('local'))
  @UseGuards(ThrottleExceptionGuard)
  @ApiOperation({ summary: 'Authenticate user and issue tokens' })
  @ApiResponse({ status: 201, description: 'Returns access and refresh tokens in cookies' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req.user as User;
    const { accessToken, refreshToken } = this.authService.generateTokens(user);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { user };
  }

  @Get('refresh')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({ status: 200, description: 'Returns new access token' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.refresh_token;
    const { accessToken, user } = await this.authService.verifyRefreshToken(token);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 15 * 60 * 1000,
    });
  
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('logout')
  @ApiOperation({ summary: 'Log out user and clear tokens' })
  @ApiResponse({ status: 200, description: 'Session successfully terminated' })
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    return { message: 'Sesión cerrada correctamente' };
  }

}
