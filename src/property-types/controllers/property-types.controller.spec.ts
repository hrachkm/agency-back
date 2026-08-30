import { Test, TestingModule } from '@nestjs/testing';
import { ControllersPropertyTypesController } from '../controllers-property-types.controller';

describe('ControllersPropertyTypesController', () => {
  let controller: ControllersPropertyTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ControllersPropertyTypesController],
    }).compile();

    controller = module.get<ControllersPropertyTypesController>(
      ControllersPropertyTypesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
