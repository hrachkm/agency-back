import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

import { UsersService } from '@/users/services/users.service';
import { CreateUserDto, RegisteredUserDto } from '@/users/dto/user.dto';

import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { Public } from '@/shared/decorators/public.decorator';
import { CurrentUser } from '@/shared/decorators/currentUser.decorator';
import { PayloadAccessToken } from '@/auth/models/token.model';

@ApiTags('Users') // Groups all endpoints under "Users"
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve all users' })
  @ApiResponse({ status: 200, description: 'List of all registered users' })
  findAll(@Query('limit') limit?: number, @Query('offset') offset?: number) {
    return this.usersService.findAll(limit || 5, offset || 0);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a user by email' })
  @ApiParam({ name: 'email', type: String, description: 'User email address' })
  @ApiResponse({ status: 200, description: 'User data matching the email' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @Public()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User successfully created' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Patch()
  @ApiOperation({ summary: 'Update an existing user by ID' })
  @ApiResponse({ status: 200, description: 'User successfully updated' })
  @ApiResponse({ status: 404, description: 'User not found' })
  update(
    @Body() updateUserDto: RegisteredUserDto,
    @CurrentUser() currentUser: PayloadAccessToken,
  ) {
    return this.usersService.update(currentUser.ui, updateUserDto);
  }

  @Patch('remove')
  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiResponse({ status: 200, description: 'User successfully deleted' })
  @ApiResponse({ status: 404, description: 'User not found' })
  remove(@CurrentUser() currentUser: PayloadAccessToken) {
    return this.usersService.remove(currentUser.ui);
  }
}
