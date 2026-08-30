import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import {
  CreatePropertyDto,
  FilterPropertiesDto,
  UpdatePropertyDto,
  ChangePropertyStatusDto,
} from '@/properties/dto/properties.dto';

import { PropertyRepository } from '@/properties/repositories/property.repository';
import { PropertyStatus } from '../enums/property.enum';

@Injectable()
export class PropertiesService {
  constructor(private propertyRepo: PropertyRepository) {}

  async search(filters: FilterPropertiesDto, userId?: string) {
    return this.propertyRepo.findWithFilters(filters, userId);
  }

  async findOne(id: string) {
    const property = await this.propertyRepo.findOne({
      where: { id },
      relations: ['seller', 'propertyType'],
    });

    if (!property) {
      throw new NotFoundException('Inmueble no encontrado');
    }

    return property;
  }


  async create(createPropertyDto: CreatePropertyDto, sellerId: string) {
    const property = this.propertyRepo.create({
      ...createPropertyDto,
      sellerId,
    });
    const saved = await this.propertyRepo.save(property);
    const savedWithRelations = await this.propertyRepo.findOne({
      where: { id: saved.id },
      relations: ['seller', 'propertyType'],
    });

    return {
      created: true,
      property: savedWithRelations,
    };
  }
  async update(
    id: string,
    updatePropertyDto: UpdatePropertyDto,
    sellerId: string,
  ) {
    const property = await this.propertyRepo.findOne({
      where: { id },
      relations: ['seller', 'propertyType'],
    });

    if (!property) {
      throw new NotFoundException('Inmueble no encontrado');
    }

    // 1. Validar propietario
    if (property.sellerId !== sellerId) {
      throw new UnauthorizedException(
        'No tienes permisos para editar este inmueble',
      );
    }

    // 2. Validar que no esté vendido
    if (property.status === PropertyStatus.SOLD) {
      throw new ConflictException(
        'Los inmuebles vendidos no pueden ser editados',
      );
    }

    // Aplicar los cambios
    Object.assign(property, updatePropertyDto);
    const updated = await this.propertyRepo.save(property);

    return {
      updated: true,
      property: updated,
    };
  }
  async remove(id: string, sellerId: string) {
    const property = await this.propertyRepo.findOne({
      where: { id },
      relations: ['seller', 'propertyType'],
    });

    if (!property) {
      throw new NotFoundException('Inmueble no encontrado');
    }

    if (property.sellerId !== sellerId) {
      throw new UnauthorizedException(
        'No tienes permisos para eliminar este inmueble',
      );
    }

    const deletedProperty = await this.propertyRepo.softRemove(property);

    return {
      deleted: true,
      property: deletedProperty,
    };
  }
  async changeStatus(
    id: string,
    changePropertyStatusDto: ChangePropertyStatusDto,
    sellerId: string,
  ) {
    const property = await this.propertyRepo.findOne({
      where: { id },
      relations: ['seller', 'propertyType'],
    });

    if (!property) {
      throw new NotFoundException('Inmueble no encontrado');
    }

    // 1. Validar propietario
    if (property.sellerId !== sellerId) {
      throw new UnauthorizedException(
        'No tienes permisos para editar este inmueble',
      );
    }

    // 2. Validar que si está vendido, no se pueda cambiar el estado
    if (
      property.status === PropertyStatus.SOLD &&
      changePropertyStatusDto.status !== PropertyStatus.SOLD
    ) {
      throw new ConflictException(
        'Los inmuebles vendidos no pueden cambiar su estado',
      );
    }

    property.status = changePropertyStatusDto.status;
    const updated = await this.propertyRepo.save(property);

    return {
      updated: true,
      property: updated,
    };
  }
}
