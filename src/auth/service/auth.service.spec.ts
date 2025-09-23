import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { AuthService } from '@/auth/service/auth.service';
import { UsersService } from '@/users/services/users.service';
import { User } from '@/users/entities/user.entity';
import { PayloadRefreshToken } from '../models/token.model';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser: User = {
    id: 1,
    userId: "c7zBz1KxJ9",
    email: 'test@example.com',
    password: 'hashedPassword',
    role: 'admin',
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
            findOneByUserId: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
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

    it('should throw BadRequestException if password does not match', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await expect(
        authService.validateUser('test@example.com', 'wrongpassword')
      ).rejects.toThrow(BadRequestException);
    });

    it('should return null if user is not found', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(null);

      const result = await authService.validateUser('notfound@example.com', 'password');
      expect(result).toBeNull();
    });
  });

  describe('generateTokens', () => {
    it('should return access and refresh tokens', () => {
      jest.spyOn(jwtService, 'sign').mockReturnValue('mocked-token');

      const result = authService.generateTokens(mockUser);
      expect(result).toEqual({
        accessToken: 'mocked-token',
        refreshToken: 'mocked-token',
      });
    });
  });

  describe('verifyRefreshToken', () => {
    it('should return new tokens and user if refresh token is valid', async () => {
      const payload: PayloadRefreshToken = { ui: mockUser.userId };
      jest.spyOn(jwtService, 'verify').mockReturnValue(payload);
      jest.spyOn(usersService, 'findOneByUserId').mockResolvedValue(mockUser);
      jest.spyOn(jwtService, 'sign').mockReturnValue('new-token');

      const result = await authService.verifyRefreshToken('valid-token');

      expect(result.user).toHaveProperty('userId');
      expect(typeof result.user.userId).toBe('string');
      expect(result.user.userId).toStrictEqual(mockUser.userId);
      expect(result.user.userId).toHaveLength(10);
      expect(result).toEqual({
        accessToken: 'new-token',
        refreshToken: 'new-token',
        user: mockUser,
      });
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(authService.verifyRefreshToken('invalid-token')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw BadRequestException if user is not found', async () => {
      const payload = { email: 'notfound@example.com', role: 'user' };
      jest.spyOn(jwtService, 'verify').mockReturnValue(payload);
      jest.spyOn(usersService, 'findOne').mockRejectedValue(new BadRequestException('Usuario no encontrado'));

      await expect(authService.verifyRefreshToken('valid-token')).rejects.toThrow(BadRequestException);
    });
  });
});