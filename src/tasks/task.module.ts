import { Module } from '@nestjs/common';
import { NewListingTask } from './services/new-listing.task';
import { BinanceApiModule } from '~binance-api/binance-api.module';
import { TypeOrmHelperModule } from '~core/modules/typeorm-module.module';
import { BuyDipRepository } from '~repositories/buy-dip.repository';
import { BuyDipTask } from './services/buy-dip.task';

@Module({
    imports: [TypeOrmHelperModule.forCustomRepository([BuyDipRepository]), BinanceApiModule],
    controllers: [],
    providers: [BuyDipTask, NewListingTask],
    exports: []
})
export class TaskModule {}
