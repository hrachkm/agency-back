import {
  Get,
  Query,
  Body,
  Controller,
  Patch,
  Param,
  Post,
  UseGuards,
  ParseUUIDPipe,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { PropertiesService } from '@/properties/services/properties.service';
import {
  CreatePropertyDto,
  UpdatePropertyDto,
  ChangePropertyStatusDto,
  FilterPropertiesDto,
} from '@/properties/dto/properties.dto';
import { CurrentUser } from '@/shared/decorators/currentUser.decorator';
import { PayloadAccessToken } from '@/auth/models/token.model';

@ApiTags('Properties')
@UseGuards(JwtAuthGuard)
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get()
  @ApiOperation({ summary: 'Search and paginate properties with filters' })
  @ApiResponse({ status: 200, description: 'Paginated properties list' })
  findAll(
    @Query() filters: FilterPropertiesDto,
    @CurrentUser() currentUser: PayloadAccessToken,
  ) {
    return this.propertiesService.search(filters, currentUser.ui);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single property by id' })
  @ApiResponse({ status: 200, description: 'Property found' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.propertiesService.findOne(id);
  }


  @Post()
  @ApiOperation({ summary: 'Create a new property' })
  @ApiResponse({ status: 201, description: 'Property successfully created' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  create(
    @Body() createPropertyDto: CreatePropertyDto,
    @CurrentUser() currentUser: PayloadAccessToken,
  ) {
    return this.propertiesService.create(createPropertyDto, currentUser.ui);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing property' })
  @ApiResponse({ status: 200, description: 'Property successfully updated' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized to edit this property',
  })
  @ApiResponse({ status: 409, description: 'Sold properties cannot be edited' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
    @CurrentUser() currentUser: PayloadAccessToken,
  ) {
    return this.propertiesService.update(id, updatePropertyDto, currentUser.ui);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Change the status of an existing property' })
  @ApiResponse({
    status: 200,
    description: 'Property status successfully updated',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized to edit this property',
  })
  @ApiResponse({
    status: 409,
    description: 'Sold properties cannot change status',
  })
  changeStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() changePropertyStatusDto: ChangePropertyStatusDto,
    @CurrentUser() currentUser: PayloadAccessToken,
  ) {
    return this.propertiesService.changeStatus(
      id,
      changePropertyStatusDto,
      currentUser.ui,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete an existing property' })
  @ApiResponse({ status: 200, description: 'Property successfully deleted' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized to delete this property',
  })
  @ApiResponse({ status: 404, description: 'Property not found' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: PayloadAccessToken,
  ) {
    return this.propertiesService.remove(id, currentUser.ui);
  }
}
