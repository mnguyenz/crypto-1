import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SeedService } from './seed.service';

@Controller('seed')
@ApiTags('seed')
export class SeedController {
    constructor(private seedService: SeedService) {}

    @Get('seed-buy-dip')
    async seedBuyDip(): Promise<string> {
        return await this.seedService.seedBuyDip();
    }
}
