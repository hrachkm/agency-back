import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '@/users/entities/user.entity';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;
  let userRepo: any;

  const mockUsers = [
    { id: 1, email: 'admin@example.com', password: 'hashed', role: 'admin' },
    { id: 2, email: 'user@example.com', password: 'hashed', role: 'user' },
  ];

  beforeEach(async () => {
    userRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      clear: jest.fn(),
      query: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: 'PG',
          useValue: {}, // Puedes mockear métodos si usas clientPg directamente
        },
        {
          provide: getRepositoryToken(User),
          useValue: userRepo,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return users if found', async () => {
      userRepo.find.mockResolvedValue(mockUsers);
      const result = await service.findAll();
      expect(result).toEqual(mockUsers);
    });

    it('should throw if no users found', async () => {
      userRepo.find.mockResolvedValue([]);
      await expect(service.findAll()).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return user if found', async () => {
      userRepo.findOne.mockResolvedValue(mockUsers[0]);
      const result = await service.findOne('admin@example.com');
      expect(result).toEqual(mockUsers[0]);
    });

    it('should throw if user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('notfound@example.com')).rejects.toThrow(BadRequestException);
    });
  });

  describe('create', () => {
    it('should create and return new user', async () => {
      const newUser = { email: 'new@example.com', password: '1234', role: 'user' };
      const hashedPassword = 'hashed1234';
      const createdUser = { ...newUser, password: hashedPassword, id: 3 };

      userRepo.findOne.mockResolvedValue(null);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword);
      userRepo.create.mockReturnValue(createdUser);
      userRepo.save.mockResolvedValue(createdUser);

      const result = await service.create(newUser);
      expect(result).toEqual({ created: true, user: createdUser });
    });

    it('should throw if user already exists', async () => {
      userRepo.findOne.mockResolvedValue(mockUsers[0]);
      await expect(service.create({ email: 'admin@example.com', password: '1234', role: 'admin' }))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw if save fails', async () => {
      userRepo.findOne.mockResolvedValue(null);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed');
      userRepo.create.mockReturnValue({});
      userRepo.save.mockResolvedValue(null);

      await expect(service.create({ email: 'fail@example.com', password: '1234', role: 'user' }))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('removeAll', () => {
    it('should clear users and reset sequence', async () => {
      userRepo.clear.mockResolvedValue(undefined);
      userRepo.query.mockResolvedValue(undefined);

      const result = await service.removeAll();
      expect(result).toBe(true);
      expect(userRepo.clear).toHaveBeenCalled();
      expect(userRepo.query).toHaveBeenCalledWith('ALTER SEQUENCE user_id_seq RESTART WITH 1');
    });

    it('should return false if error occurs', async () => {
      userRepo.clear.mockRejectedValue(new Error('fail'));
      const result = await service.removeAll();
      expect(result).toBe(false);
    });
  });
});