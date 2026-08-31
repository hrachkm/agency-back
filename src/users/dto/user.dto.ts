import { PartialType, ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MaxLength,
  Matches,
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  IsEnum,
} from 'class-validator';
import { UserRole } from '../enums/users-role.entity';

export function Match(property: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'Match',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return value === relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          return 'Los passwords no coinciden';
        },
      },
    });
  };
}

export class CreateUserDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the user',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Valid email address of the user',
  })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(30)
  email: string;

  @ApiProperty({
    example: 'Pwd@123',
    description: 'User password',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(8)
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])/, {
    message:
      'El password debe contener al menos una may�scula, una min�scula, un n�mero y un car�cter especial',
  })
  password: string;

  @ApiProperty({
    example: 'admin',
    description: 'Valid user role, either "admin" or "user"',
  })
  @IsEnum(UserRole, {
    message: () =>
      `El role del usuario debe ser user o admin`,
  })
  @IsNotEmpty()
  role: UserRole;

  @ApiProperty({
    example: 'Pwd@123',
    description: 'Confirm user password',
  })
  @IsString()
  @IsNotEmpty()
  @Match('password', {
    message: 'Las contrase�as no coinciden',
  })
  confirmPassword: string;
}

export class RegisteredUserDto extends PartialType(CreateUserDto) {}
