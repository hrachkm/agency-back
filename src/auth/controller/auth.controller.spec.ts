import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
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

  const mockTokenResponse = {
    token: 'mock-jwt-token',
    user: mockUser,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            generateJwt: jest.fn().mockReturnValue(mockTokenResponse),
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
    it('should set cookie and return token and user', async() => {
      const mockRequest = { user: mockUser } as any;

      const mockCookie = jest.fn();
      const mockResponse = { cookie: mockCookie } as any;

      const result = await controller.login(mockRequest, mockResponse);

      expect(authService.generateJwt).toHaveBeenCalledWith(mockUser);
      expect(mockCookie).toHaveBeenCalledWith('auth_token', mockTokenResponse.token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24, // 1 día
      });
      expect(result).toEqual({ user: mockUser });
    });
  });


  describe('validate', () => {
    it('should return validated user from AuthService', async () => {
      const validatedUser = {
        id: 1,
        email: 'test@example.com',
        password: 'test123',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Simula el método validateToken
      jest.spyOn(authService, 'validateToken').mockResolvedValue(validatedUser);

      const mockRequest = {
        user: mockUser,
      } as any;

      const result = await controller.validate(mockRequest);
      expect(result).toEqual(validatedUser);
      expect(authService.validateToken).toHaveBeenCalledWith(mockUser);
    });

    it('should throw BadRequestException if user not found', async () => {
      jest
        .spyOn(authService, 'validateToken')
        .mockRejectedValue(new BadRequestException('Usuario no registrado'));

      const mockRequest = {
        user: { email: 'notfound@example.com' },
      } as any;

      await expect(controller.validate(mockRequest)).rejects.toThrow(BadRequestException);
      await expect(controller.validate(mockRequest)).rejects.toThrow('Usuario no registrado');
    });

  });

  describe('logout', () => {
    it('should clear auth_token cookie and return message', () => {
      const mockClearCookie = jest.fn();
      const mockResponse = { clearCookie: mockClearCookie } as any;

      const result = controller.logout(mockResponse);
      expect(mockClearCookie).toHaveBeenCalledWith('auth_token', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      });
      expect(result).toEqual({ message: 'Sesión cerrada correctamente' });
    });
  });

});