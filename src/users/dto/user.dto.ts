import { PartialType } from '@nestjs/swagger';
import {
	IsString,
	IsNotEmpty,
	IsEmail,
} from 'class-validator';

export class CreateUserDto {

	@IsString()
	@IsEmail()
	@IsNotEmpty()
	email: string;

	@IsString()
	@IsNotEmpty()
	password: string

	@IsString()
	@IsNotEmpty()
	role: string

}

export class RegisteredUserDto extends PartialType(CreateUserDto) { }
