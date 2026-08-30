import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { PropertyTypesService } from '@/property-types/services/property-types.service';
import { CreatePropertyTypeDto } from '@/property-types/dto/property-types.dto';

@ApiTags('Property Types')
@UseGuards(JwtAuthGuard)
@Controller('property-types')
export class PropertyTypesController {
  constructor(private readonly propertyTypesService: PropertyTypesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new property type' })
  @ApiResponse({ status: 201, description: 'Property type successfully created' })
  @ApiResponse({ status: 400, description: 'Property type already exists or invalid data' })
  create(@Body() createPropertyTypeDto: CreatePropertyTypeDto) {
    return this.propertyTypesService.create(createPropertyTypeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all property types paginated' })
  @ApiResponse({ status: 200, description: 'Paginated list of property types' })
  @ApiResponse({ status: 400, description: 'No property types found' })
  getAll(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.propertyTypesService.getAll(limit || 10, offset || 0);
  }

}