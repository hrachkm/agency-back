import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { UsersService } from '../../users/services/users.service';
import { User } from '../../users/entities/user.entity';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword',
    role: 'admin',
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      //imports: [UsersModule],
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const result = await authService.validateUser('test@example.com', 'password');
      expect(result).toEqual(mockUser);
    });

    it('should throw BadRequestException if user is not found', async () => {
      jest
        .spyOn(usersService, 'findOne')
        .mockRejectedValue(new BadRequestException('Usuario no registrado'));

      await expect(
        authService.validateUser('wrong@example.com', 'password')
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if password does not match', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await expect(
        authService.validateUser('test@example.com', 'wrongpassword')
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('generateJwt', () => {
    it('should return token and user', () => {
      const token = 'jwt-token';
      jest.spyOn(jwtService, 'sign').mockReturnValue(token);

      const result = authService.generateJwt(mockUser);
      expect(result).toEqual({
        token,
        user: mockUser,
      });
    });
  });

  describe('validate user token', () => {
    it('should return validated user if token is valid', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      jest.spyOn(usersService, 'findOne').mockResolvedValue({ ...mockUser });

      const result = await authService.validateToken(mockUser);

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });

      expect(result).not.toHaveProperty('password');
    });

    it('should throw BadRequestException if user is not found during token validation', async () => {
      jest
        .spyOn(usersService, 'findOne')
        .mockRejectedValue(new BadRequestException('Usuario no registrado'));

      await expect(authService.validateToken({ email: 'notfound@example.com' } as User))
        .rejects
        .toThrow(BadRequestException);
    });
  })
});