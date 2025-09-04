import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { IS_PUBLIC_KEY } from '@/shared/decorators/public.decorator';


describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = {
      get: jest.fn(),
    } as unknown as Reflector;

    guard = new JwtAuthGuard(reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true if route is public', () => {
      const mockContext: ExecutionContext = {
        getHandler: jest.fn().mockReturnValue(() => {}),
      } as any;

      jest.spyOn(reflector, 'get').mockReturnValue(true);

      const result = guard.canActivate(mockContext);
      expect(result).toBe(true);
      expect(reflector.get).toHaveBeenCalledWith(IS_PUBLIC_KEY, mockContext.getHandler());
    });

    it('should call super.canActivate if route is not public', () => {
      const mockContext = {} as ExecutionContext;
      jest.spyOn(reflector, 'get').mockReturnValue(false);

      const superSpy = jest.spyOn(JwtAuthGuard.prototype, 'canActivate').mockReturnValue(true);

      const result = guard.canActivate(mockContext);
      expect(superSpy).toHaveBeenCalledWith(mockContext);
      expect(result).toBe(true);
    });
  });
});