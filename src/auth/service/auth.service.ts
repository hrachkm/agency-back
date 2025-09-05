import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { User } from '@/users/entities/user.entity';
import { UsersService } from '@/users/services/users.service';

import { PayloadToken } from '@/auth/models/token.model';


@Injectable()
export class AuthService {

	constructor(
		private usersService: UsersService,
		private jwtService: JwtService
	){}

	async validateUser(email: string, password: string) {

		const user = await this.usersService.findOne(email);
		const isMatch = await user ? await bcrypt.compare(password, user.password) : false

		if(user && isMatch){
			return user;
		} else if(!isMatch){
			throw new BadRequestException('Contraseña incorrecta');
		} else {
			return null;
		}
	}

	generateJwt(user: User){
		const payload: PayloadToken = {
			role: user.role,
			sub: user.id
		}

		return {
			token: this.jwtService.sign(payload),
			user
		}
	}
}
