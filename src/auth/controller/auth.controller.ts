import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

import { AuthService } from '../service/auth.service';
import { User } from '@/users/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor( private authService: AuthService ){}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@Req() req: Request){
    return this.authService.generateJwt(req.user as User);
  }
}
