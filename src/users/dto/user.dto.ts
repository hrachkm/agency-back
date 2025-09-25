import { PartialType, ApiProperty } from '@nestjs/swagger';
import {
	IsString,
	IsNotEmpty,
	IsEmail,
} from 'class-validator';

export class CreateUserDto {

	@ApiProperty({
		example: 'user@example.com',
		description: 'Valid email address of the user',
	})
	@IsString()
	@IsEmail()
	@IsNotEmpty()
	email: string;

	@ApiProperty({
		example: 'securePassword123',
		description: 'User password (should be hashed before storing)',
	})
	@IsString()
	@IsNotEmpty()
	password: string

	@ApiProperty({
		example: 'admin',
		description: 'Role assigned to the user (e.g., admin, employee, client, user)',
	})
	@IsString()
	@IsNotEmpty()
	role: string

}

export class RegisteredUserDto extends PartialType(CreateUserDto) { }
