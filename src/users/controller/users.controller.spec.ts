import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from '@/users/services/users.service';
import { CreateUserDto, RegisteredUserDto } from '@/users/dto/user.dto';
import { User } from '@/users/entities/user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword',
    role: 'admin',
  } as User;

  const mockUsers = [mockUser];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn().mockResolvedValue(mockUsers),
            findOne: jest.fn().mockResolvedValue(mockUser),
            create: jest.fn().mockResolvedValue({ created: true, user: mockUser }),
            update: jest.fn().mockResolvedValue(`This action updates a #1 user`),
            remove: jest.fn().mockResolvedValue(`This action removes a #1 user`),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = await controller.findAll();
      expect(result).toEqual(mockUsers);
      expect(usersService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user by email', async () => {
      const result = await controller.findOne('test@example.com');
      expect(result).toEqual(mockUser);
      expect(usersService.findOne).toHaveBeenCalledWith('test@example.com');
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const dto: CreateUserDto = {
        email: 'new@example.com',
        password: '1234',
        role: 'user',
      };
      const result = await controller.create(dto);
      expect(result).toEqual({ created: true, user: mockUser });
      expect(usersService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const dto: RegisteredUserDto = {
        email: 'updated@example.com',
        password: 'updated123',
        role: 'admin',
      };
      const result = await controller.update('1', dto);
      expect(result).toBe(`This action updates a #1 user`);
      expect(usersService.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const result = await controller.remove('1');
      expect(result).toBe(`This action removes a #1 user`);
      expect(usersService.remove).toHaveBeenCalledWith(1);
    });
  });
});