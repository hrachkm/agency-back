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
    userId: "c7zBz1KxJ9",
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
            verifyRefreshToken: jest.fn().mockResolvedValue({ ...mockTokens, user: mockUser }),
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
      expect(result).toEqual(mockUser);

    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      jest.spyOn(authService, 'verifyRefreshToken').mockRejectedValue(new UnauthorizedException('Refresh token inválido'));

      const mockRequest = { cookies: { refresh_token: 'invalid-token' } } as any;
      const mockResponse = { cookie: jest.fn() } as any;

      await expect(controller.refresh(mockRequest, mockResponse)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw BadRequestException if user is not found', async () => {
      jest.spyOn(authService, 'verifyRefreshToken').mockRejectedValue(
        new BadRequestException('Usuario no encontrado')
      );

      const mockRequest = { cookies: { refresh_token: 'valid-token' } } as any;
      const mockResponse = { cookie: jest.fn() } as any;

      await expect(controller.refresh(mockRequest, mockResponse)).rejects.toThrow(BadRequestException);
    });
  });

  describe('logout', () => {
    it('should clear cookies and return message', () => {
      const mockClearCookie = jest.fn();
      const mockResponse = { clearCookie: mockClearCookie } as any;

      const result = controller.logout(mockResponse);

      expect(mockClearCookie).toHaveBeenCalledWith('access_token', { "httpOnly": true, "sameSite": "none", "secure": true });
      expect(mockClearCookie).toHaveBeenCalledWith('refresh_token', { "httpOnly": true, "sameSite": "none", "secure": true });
      expect(result).toEqual({ message: 'Sesión cerrada correctamente' });
    });
  });
});