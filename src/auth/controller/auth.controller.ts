import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { AuthService } from '../service/auth.service';
import { User } from '@/users/entities/user.entity';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('login')
  @UseGuards(AuthGuard('local'))
  @ApiOperation({ summary: 'Authenticate user and issue tokens' })
  @ApiResponse({ status: 201, description: 'Returns access and refresh tokens in cookies' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req.user as User;
    const { accessToken, refreshToken } = this.authService.generateTokens(user);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { user };
  }

  @Get('refresh')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({ status: 200, description: 'Returns new access and refresh tokens' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.refresh_token;

    const { accessToken, refreshToken, user } = await this.authService.verifyRefreshToken(token);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Log out user and clear tokens' })
  @ApiResponse({ status: 200, description: 'Session successfully terminated' })
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return { message: 'Sesión cerrada correctamente' };
  }

}
