import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';

import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { AuthService } from '../service/auth.service';
import { User } from '@/users/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor( private authService: AuthService ){}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req.user as User;
    const token = this.authService.generateJwt(user);

    res.cookie('auth_token', token.token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24, // 1 día
    });
    return { user };
  }

  @UseGuards(JwtAuthGuard)
  @Get('validate')
  validate(@Req() req: Request) {
    return this.authService.validateToken(req.user as User);
  }

  @Get('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    return { message: 'Sesión cerrada correctamente' };
  }


}
