import { Injectable, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Request } from 'express';

import config from '@/config';
import { PayloadToken } from '@/auth/models/token.model';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {

	constructor(@Inject(config.KEY) private configService: ConfigType<typeof config>) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				(req: Request) => {
					return req?.cookies?.access_token || null;
				}
			]),
			ignoreExpiration: false,
			secretOrKey: configService.jwtAccessSecret, //Cambiar segun conveniencia del proyecto
		});
	}

	validate(payload: PayloadToken) {
		return payload;
	}
}