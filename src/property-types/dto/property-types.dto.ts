import { PartialType, ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class CreatePropertyTypeDto {
  @ApiProperty({
    example: 'Apartamento',
    description: 'Nombre del tipo de propiedad',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;
}

export class UpdatePropertyTypeDto extends PartialType(CreatePropertyTypeDto) {}
