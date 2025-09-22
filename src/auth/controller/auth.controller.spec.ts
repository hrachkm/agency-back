import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as dayjs from 'dayjs';
import { AuthController } from './auth.controller';
import { AuthService } from '../service/auth.service';
import { User } from '@/users/entities/user.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword',
    role: 'admin',
  } as User;

  const mockTokens = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            generateTokens: jest.fn().mockReturnValue(mockTokens),
            verifyRefreshToken: jest.fn().mockResolvedValue(mockTokens),
            validateToken: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should set cookies and return user', async () => {
      const mockRequest = { user: mockUser } as any;
      const mockCookie = jest.fn();
      const mockResponse = { cookie: mockCookie } as any;

      const result = await controller.login(mockRequest, mockResponse);

      expect(authService.generateTokens).toHaveBeenCalledWith(mockUser);
      expect(mockCookie).toHaveBeenCalledWith('access_token', mockTokens.accessToken, expect.any(Object));
      expect(mockCookie).toHaveBeenCalledWith('refresh_token', mockTokens.refreshToken, expect.any(Object));
      expect(result).toEqual({ user: mockUser });
    });
  });

  describe('refresh', () => {
    it('should verify token, set cookies and return message', async () => {
      const mockRequest = { cookies: { refresh_token: 'valid-token' } } as any;
      const mockCookie = jest.fn();
      const mockResponse = { cookie: mockCookie } as any;

      const result = await controller.refresh(mockRequest, mockResponse);

      expect(authService.verifyRefreshToken).toHaveBeenCalledWith('valid-token');
      expect(mockCookie).toHaveBeenCalledWith('access_token', mockTokens.accessToken, expect.any(Object));
      expect(mockCookie).toHaveBeenCalledWith('refresh_token', mockTokens.refreshToken, expect.any(Object));
      expect(result).toEqual({ message: 'Tokens renovados correctamente' });
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      jest.spyOn(authService, 'verifyRefreshToken').mockRejectedValue(new UnauthorizedException('Refresh token inválido'));

      const mockRequest = { cookies: { refresh_token: 'invalid-token' } } as any;
      const mockResponse = { cookie: jest.fn() } as any;

      await expect(controller.refresh(mockRequest, mockResponse)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validate', () => {
    it('should return validated user from AuthService', async () => {
      const now = dayjs().toDate();

      const validatedUser = {
        ...mockUser,
        createdAt: now,
        updatedAt: now,
      };

      jest.spyOn(authService, 'validateToken').mockResolvedValue(validatedUser);

      const mockRequest = { user: mockUser } as any;

      const result = await controller.validate(mockRequest);

      expect(result).toMatchObject({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        createdAt: now,
        updatedAt: now,
      });

      expect(result).not.toHaveProperty('hashedPassword');
      expect(authService.validateToken).toHaveBeenCalledWith(mockUser);
    });


    it('should throw BadRequestException if user not found', async () => {
      jest.spyOn(authService, 'validateToken').mockRejectedValue(new BadRequestException('Usuario no registrado'));

      const mockRequest = { user: { email: 'notfound@example.com' } } as any;

      await expect(controller.validate(mockRequest)).rejects.toThrow(BadRequestException);
    });
  });

  describe('logout', () => {
    it('should clear cookies and return message', () => {
      const mockClearCookie = jest.fn();
      const mockResponse = { clearCookie: mockClearCookie } as any;

      const result = controller.logout(mockResponse);

      expect(mockClearCookie).toHaveBeenCalledWith('access_token');
      expect(mockClearCookie).toHaveBeenCalledWith('refresh_token');
      expect(result).toEqual({ message: 'Sesión cerrada correctamente' });
    });
  });
});