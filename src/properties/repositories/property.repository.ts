import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Property } from '@/properties/entities/properties.entity';
import { FilterPropertiesDto } from '@/properties/dto/properties.dto';
import { PropertyOrderBy } from '@/properties/enums/property.enum';

@Injectable()
export class PropertyRepository extends Repository<Property> {
  constructor(private dataSource: DataSource) {
    super(Property, dataSource.createEntityManager());
  }

  async findWithFilters(filters: FilterPropertiesDto, userId?: string) {
    const {
      limit = 10 as number,
      offset = 0 as number,
      seller_id,
      onlyMine,
      status,
      precioMin,
      precioMax,
      search,
      orderBy,
      order = 'ASC',
    } = filters;

    const query = this.createQueryBuilder('property')
      .leftJoinAndSelect('property.propertyType', 'propertyType')
      .leftJoinAndSelect('property.seller', 'seller');

    if (seller_id) {
      query.andWhere('property.sellerId = :seller_id', { seller_id });
    }

    if (onlyMine && userId) {
      query.andWhere('property.sellerId = :userId', { userId });
    }

    if (status) {
      query.andWhere('property.status = :status', { status });
    }

    if (precioMin !== undefined) {
      query.andWhere('property.price >= :precioMin', { precioMin });
    }

    if (precioMax !== undefined) {
      query.andWhere('property.price <= :precioMax', { precioMax });
    }

    if (search) {
      query.andWhere('property.address ILIKE :search', {
        search: `%${search}%`,
      });
    }

    if (orderBy) {
      const dbOrderBy =
        orderBy === PropertyOrderBy.CREATED_AT ? 'property.createdAt' : 'property.price';
      query.orderBy(dbOrderBy, order);
    } else {
      query.orderBy('property.createdAt', 'DESC');
    }

    const [data, total] = await query
      .take(limit)
      .skip(offset)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);
    const page = Math.floor(offset / limit) + 1;

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }
}
