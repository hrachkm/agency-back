import { Module } from '@nestjs/common';

import { SeedController } from './controller/seed.controller';
import { SeedService } from './service/seed.service';

import { UsersModule } from '@/users/users.module';
import { PropertiesModule } from '@/properties/properties.module';
import { PropertyTypesModule } from '@/property-types/property-types.module';

@Module({
  imports: [UsersModule, PropertiesModule, PropertyTypesModule],
  controllers: [SeedController],
  providers: [SeedService],
  exports: [SeedService]
})
export class SeedModule {}
