import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User } from '@/users/entities/user.entity';

interface UserFormat {
  id: number;
  userId: string;
  email: string;
  password: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UserCreated {
  created: Boolean,
  user: UserFormat
}

describe('UsersService', () => {
  let service: UsersService;
  let userRepo: any;
  let userCreated: UserCreated;

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
          useValue: {},
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
      const createdUser = { ...newUser, password: hashedPassword, id: 3, userId: '2dsdf51dfg' };

      userRepo.findOne.mockResolvedValue(null);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword);
      userRepo.create.mockReturnValue(createdUser);
      userRepo.save.mockResolvedValue(createdUser);

      userCreated = await service.create(newUser);
      expect(userCreated).toEqual({ created: true, user: createdUser });
      expect(userCreated.user.userId).toHaveLength(10);
      expect(typeof userCreated.user.userId).toBe('string');

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

  it('should remove a user and return the user object', async () => {
    const mockDeletedUser = {
      id: 3,
      email: 'deleted@example.com',
      password: 'hashed',
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Simula el resultado de query: [[user], affectedRows]
    userRepo.query.mockResolvedValue([[mockDeletedUser], 1]);

    const result = await service.remove(3);
    expect(result).toHaveProperty('removed', true);
    expect(result).toHaveProperty('user', mockDeletedUser);
    expect(userRepo.query).toHaveBeenCalledWith(
      `DELETE FROM \"user\" WHERE id = $1 RETURNING id, email, role, \"createdAt\", \"updatedAt\"`,
      [3]
    );
  });

  it('should throw BadRequestException if user does not exist', async () => {
    userRepo.query.mockResolvedValue([[], 0]);

    await expect(service.remove(999)).rejects.toThrow(BadRequestException);
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