import { ThrottleExceptionGuard } from './throttle-custom.guard';
import { Reflector } from '@nestjs/core';
import { ThrottlerStorage } from '@nestjs/throttler';
import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';

describe('ThrottleExceptionGuard', () => {
  let guard: ThrottleExceptionGuard;

  beforeEach(() => {
    const reflectorMock = {} as Reflector;
    const storageMock = {
      getRecord: jest.fn(),
      addRecord: jest.fn(),
    } as unknown as ThrottlerStorage;

    guard = new ThrottleExceptionGuard([{
      ttl: 60,
      limit: 20,
    }], storageMock, reflectorMock);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should throw custom throttling exception', async () => {
    await expect(guard['throwThrottlingException']).rejects.toThrow(
      new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many attempts. Please wait one minute and try again.',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      )
    );
  });
});