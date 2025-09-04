import { Controller, Get } from '@nestjs/common';

import { SeedService } from '@/seed/service/seed.service';

@Controller('seed')
export class SeedController {
	constructor(private seedService: SeedService){}

	@Get()
	generateData() {
		return this.seedService.generateData();
	}
}
