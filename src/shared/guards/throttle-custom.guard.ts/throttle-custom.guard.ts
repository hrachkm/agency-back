import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class ThrottleExceptionGuard extends ThrottlerGuard {
  protected async throwThrottlingException(): Promise<void> {
    throw new HttpException(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: 'Too many attempts. Please wait one minute and try again.',
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}