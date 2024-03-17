import { Module } from '@nestjs/common';
import { SeedController } from './seed.controller';
import { SeedService } from './seed.service';
import { BuyDipRepository } from '~repositories/buy-dip.repository';
import { TypeOrmHelperModule } from '~core/modules/typeorm-module.module';

@Module({
    imports: [TypeOrmHelperModule.forCustomRepository([BuyDipRepository])],
    controllers: [SeedController],
    providers: [SeedService]
})
export class SeedModule {}
