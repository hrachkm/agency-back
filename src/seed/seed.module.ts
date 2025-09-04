import { Module } from '@nestjs/common';

import { SeedController } from './controller/seed.controller';
import { SeedService } from './service/seed.service';

import { UsersModule } from '@/users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [SeedController],
  providers: [SeedService],
  exports: [SeedService]
})
export class SeedModule {}
