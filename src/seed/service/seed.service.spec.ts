import { Test, TestingModule } from '@nestjs/testing';
import { SeedService } from './seed.service';
import { UsersService } from '@/users/services/users.service';
import { CreateUserDto } from '@/users/dto/user.dto';

describe('SeedService', () => {
  let service: SeedService;
  let usersService: UsersService;

  const mockUsers: CreateUserDto[] = [
    { email: 'admin@example.com', password: 'admin123', role: 'admin' },
    { email: 'user@example.com', password: 'user123', role: 'user' },
    { email: 'doctor@example.com', password: 'doctor123', role: 'doctor' },
    { email: 'patient@example.com', password: 'patient123', role: 'patient' },
    { email: 'employee@example.com', password: 'employee123', role: 'employee' },
    { email: 'client@example.com', password: 'client123', role: 'client' },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeedService,
        {
          provide: UsersService,
          useValue: {
            removeAll: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SeedService>(SeedService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateData', () => {
    it('should clean database and create users', async () => {
      const removeAllSpy = jest.spyOn(usersService, 'removeAll');
      const createSpy = jest.spyOn(usersService, 'create');

      const result = await service.generateData();

      expect(removeAllSpy).toHaveBeenCalled();
      expect(createSpy).toHaveBeenCalledTimes(mockUsers.length);
      expect(result).toBe('DATOS DE MUESTRA CREADOS');
    });
  });

  describe('createUsers', () => {
    it('should call usersService.create for each user', async () => {
      const createSpy = jest.spyOn(usersService, 'create');

      // Simular el método con los datos de prueba
      await service['createUsers']();

      expect(createSpy).toHaveBeenCalledTimes(mockUsers.length);
      mockUsers.forEach((user, index) => {
        expect(createSpy).toHaveBeenNthCalledWith(index + 1, expect.objectContaining(user));
      });
    });
  });
});