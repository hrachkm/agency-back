import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { SeedService } from '@/seed/service/seed.service';

@ApiTags('Seed')
@Controller('seed')
export class SeedController {
	constructor(private seedService: SeedService){}

	@Get()
	@ApiOperation({ summary: 'Generate sample data for the application' })
	@ApiResponse({
		status: 200,
		description: 'Returns a confirmation or result of the seeding process',
	})
	generateData() {
		return this.seedService.generateData();
	}
}
