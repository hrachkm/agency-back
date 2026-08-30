import { PartialType, ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsEnum,
  IsUUID,
  IsBoolean,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

import {
  PropertyStatus,
  PropertyOrderBy,
  OrderDirection,
} from '@/properties/enums/property.enum';

export class CreatePropertyDto {
  @ApiProperty({
    example: 'Av. Siempreviva 742',
    description: 'Direccion de la propiedad',
  })
  @IsString({ message: 'La direccion debe ser un texto' })
  @IsNotEmpty({ message: 'La direccion no puede estar vacia' })
  @MaxLength(100, {
    message: 'La direccion no puede superar los 100 caracteres',
  })
  address: string;

  @ApiProperty({
    example: 150000,
    description: 'Precio de la propiedad (debe ser mayor a 0)',
  })
  @IsNumber({}, { message: 'El precio debe ser un numero' })
  @IsPositive({ message: 'El precio debe ser mayor a 0' })
  price: number;

  @ApiProperty({
    example: 3,
    description: 'Numero de habitaciones',
    required: false,
  })
  @IsNumber({}, { message: 'El numero de habitaciones debe ser un numero' })
  @Min(0, { message: 'El numero de habitaciones no puede ser negativo' })
  @IsOptional()
  bedrooms?: number;

  @ApiProperty({
    example: 85.5,
    description: 'Metros cuadrados',
    required: false,
  })
  @IsNumber({}, { message: 'Los metros cuadrados deben ser un numero' })
  @IsPositive({ message: 'Los metros cuadrados deben ser mayor a 0' })
  @IsOptional()
  squareMeters?: number;

  @ApiProperty({
    example: 'uuid-del-tipo',
    description: 'ID del tipo de propiedad',
  })
  @IsUUID('4', {
    message: 'El ID del tipo de propiedad debe ser un UUID valido',
  })
  @IsNotEmpty({ message: 'El ID del tipo de propiedad no puede estar vacio' })
  propertyTypeId: string;
}

export class UpdatePropertyDto extends PartialType(CreatePropertyDto) {
  @IsEnum(PropertyStatus, {
    message: () =>
      `El estado debe ser uno de los siguientes valores: ${Object.values(PropertyStatus).join(', ')}`,
  })
  @IsOptional()
  status?: PropertyStatus;
}

export class ChangePropertyStatusDto {
  @ApiProperty({
    enum: PropertyStatus,
    example: PropertyStatus.SOLD,
    description: 'Nuevo estado de la propiedad',
  })
  @IsEnum(PropertyStatus, {
    message: () =>
      `El estado debe ser uno de los siguientes valores: ${Object.values(PropertyStatus).join(', ')}`,
  })
  @IsNotEmpty({ message: 'El estado no puede estar vacio' })
  status: PropertyStatus;
}

export class FilterPropertiesDto {
  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El limite debe ser un numero entero' })
  @Min(1, { message: 'El limite debe ser al menos 1' })
  limit?: number = 10;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El offset debe ser un numero entero' })
  @Min(0, { message: 'El offset no puede ser negativo' })
  offset?: number = 0;

  @ApiProperty({ required: false, description: 'UUID del vendedor' })
  @IsOptional()
  @IsUUID('4', { message: 'El seller_id debe ser un UUID valido' })
  seller_id?: string;

  @ApiProperty({
    required: false,
    description:
      'Si es true, filtra solo las propiedades del usuario autenticado',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: 'onlyMine debe ser un valor booleano (true o false)' })
  onlyMine?: boolean;

  @ApiProperty({ required: false, enum: PropertyStatus })
  @IsOptional()
  @IsEnum(PropertyStatus, {
    message: () =>
      `El estado debe ser uno de los siguientes valores: ${Object.values(PropertyStatus).join(', ')}`,
  })
  status?: PropertyStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El precio minimo debe ser un numero' })
  precioMin?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El precio maximo debe ser un numero' })
  precioMax?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'El parametro de busqueda debe ser un texto' })
  search?: string;

  @ApiProperty({ required: false, enum: PropertyOrderBy })
  @IsOptional()
  @IsEnum(PropertyOrderBy)
  orderBy?: PropertyOrderBy;

  @ApiProperty({ required: false, enum: OrderDirection })
  @IsOptional()
  @IsEnum(OrderDirection)
  order?: OrderDirection;
}
