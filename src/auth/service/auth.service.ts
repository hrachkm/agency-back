import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { User } from '@/users/entities/user.entity';
import { UsersService } from '@/users/services/users.service';
import { PayloadAccessToken, PayloadRefreshToken } from '@/auth/models/token.model';

@Injectable()
export class AuthService {

	constructor(
		private usersService: UsersService,
		private jwtService: JwtService
	) { }

	async validateUser(email: string, password: string) {

		const user = await this.usersService.findOne(email);

		if(!user){
			return null;
		}

		const isMatch = await user ? await bcrypt.compare(password, user.password) : false
		if (!isMatch) {
			throw new BadRequestException('Contraseña incorrecta');
		}

		return user;
	}

	generateTokens(user: User) {
		const payloadAccess: PayloadAccessToken = {
			role: user.role,
			email: user.email,
		};

		const payloadRefresh: PayloadRefreshToken = {
			ui: user.userId
		};

		const accessToken = this.jwtService.sign(payloadAccess);

		const refreshToken = this.jwtService.sign(payloadRefresh, {
			secret: process.env.JWT_REFRESH_SECRET,
			expiresIn: '7d',
		});

		return { accessToken, refreshToken };
	}

	async verifyRefreshToken(token) {
		let payload: PayloadRefreshToken;
		try {
			payload = this.jwtService.verify(token, {
				secret: process.env.JWT_REFRESH_SECRET,
			});
		} catch (err) {
			throw new UnauthorizedException('Refresh token inválido o expirado');
		}
		
		try {

			const user = await this.usersService.findOneByUserId(payload.ui);

			const { accessToken } = this.generateTokens(user);
			delete user.password
			return { accessToken, user };
			
		} catch (err) {
			throw new BadRequestException('Usuario no encontrado');
		}
	}

}
