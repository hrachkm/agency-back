import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PropertyType } from '@/property-types/entities/property-types.entity';
import { CreatePropertyTypeDto } from '@/property-types/dto/property-types.dto';

@Injectable()
export class PropertyTypesService {
  constructor(
    @InjectRepository(PropertyType)
    private propertyTypeRepo: Repository<PropertyType>,
  ) {}

  async create(createPropertyTypeDto: CreatePropertyTypeDto) {
    const { name } = createPropertyTypeDto;

    const existing = await this.propertyTypeRepo.findOne({ where: { name } });
    if (existing) {
      throw new BadRequestException('El tipo de propiedad ya existe');
    }

    const propertyType = this.propertyTypeRepo.create(createPropertyTypeDto);
    const saved = await this.propertyTypeRepo.save(propertyType);

    return {
      created: true,
      propertyType: saved,
    };
  }

  async getAll(limit: number, offset: number) {
    const [propertyTypes, total] = await this.propertyTypeRepo.findAndCount({
      take: limit,
      skip: offset,
    });

    if (!propertyTypes || propertyTypes.length === 0) {
      throw new BadRequestException('No hay tipos de propiedad registrados');
    }

    return {
      propertyTypes,
      total,
      limit,
      offset,
    };
  }
}
