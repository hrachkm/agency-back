import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getOnlineMessage(): string {
    return this.appService.onlineMessage();
  }

  @Get('database')
  getDatabaseConnection() {
    return this.appService.databaseConnection();
  }
}
