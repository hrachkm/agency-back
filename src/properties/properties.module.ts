import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertiesController } from './controllers/properties.controller';
import { PropertiesService } from './services/properties.service';
import { PropertyRepository } from './repositories/property.repository';
import { Property } from './entities/properties.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Property])],
  controllers: [PropertiesController],
  providers: [PropertiesService, PropertyRepository]
})
export class PropertiesModule {}