import { Test, TestingModule } from '@nestjs/testing';
import { SeedController } from './seed.controller';
import { SeedService } from '@/seed/service/seed.service';

describe('SeedController', () => {
  let controller: SeedController;
  let seedService: SeedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SeedController],
      providers: [
        {
          provide: SeedService,
          useValue: {
            generateData: jest.fn().mockResolvedValue('DATOS DE MUESTRA CREADOS'),
          },
        },
      ],
    }).compile();

    controller = module.get<SeedController>(SeedController);
    seedService = module.get<SeedService>(SeedService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('generateData', () => {
    it('should call seedService.generateData and return its result', async () => {
      const result = await controller.generateData();
      expect(seedService.generateData).toHaveBeenCalled();
      expect(result).toBe('DATOS DE MUESTRA CREADOS');
    });
  });
});