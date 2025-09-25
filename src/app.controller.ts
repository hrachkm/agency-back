import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  @ApiOperation({ summary: 'Check if the server is online' })
  @ApiResponse({
    status: 200,
    description: 'Returns a message indicating the server is running',
  })
  getOnlineMessage(): string {
    return this.appService.onlineMessage();
  }

  @Get('database')
  @ApiOperation({ summary: 'Check database connection status' })
  @ApiResponse({
    status: 200,
    description: 'Returns the result of the database connection check',
  })
  getDatabaseConnection() {
    return this.appService.databaseConnection();
  }

}
