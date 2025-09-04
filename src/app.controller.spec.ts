import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            onlineMessage: jest.fn().mockReturnValue('Hello World!'),
            databaseConnection: jest.fn().mockReturnValue('Database connected'),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('getOnlineMessage', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getOnlineMessage()).toBe('Hello World!');
    });
  });

  describe('getDatabaseConnection', () => {
    it('should return database connection message', () => {
      expect(appController.getDatabaseConnection()).toBe('Database connected');
    });
  });
});
