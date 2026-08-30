import { Module } from '@nestjs/common';
import { PropertyTypesController } from './controllers/property-types.controller';
import { PropertyTypesService } from './services/property-types.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyType } from './entities/property-types.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PropertyType])],
  controllers: [PropertyTypesController],
  providers: [PropertyTypesService],
  exports: [PropertyTypesService],
})
export class PropertyTypesModule {}
