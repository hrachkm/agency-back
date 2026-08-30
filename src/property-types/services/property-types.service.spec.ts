import { Test, TestingModule } from '@nestjs/testing';
import { PropertyTypesService } from './property-types.service';

describe('PropertyTypesService', () => {
  let service: PropertyTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PropertyTypesService],
    }).compile();

    service = module.get<PropertyTypesService>(PropertyTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
