import { Module } from '@nestjs/common';
import { NewListingTask } from './services/new-listing.task';
import { BinanceApiModule } from '~binance-api/binance-api.module';
import { TypeOrmHelperModule } from '~core/modules/typeorm-module.module';
import { BuyDipRepository } from '~repositories/buy-dip.repository';
import { BuyDipTask } from './services/buy-dip.task';
import { OkxApiModule } from '~okx-api/okx-api.module';
import { BuyDailyTask } from './services/buy-daily.task';
import { OrderRepository } from '~repositories/order.repository';

@Module({
    imports: [
        TypeOrmHelperModule.forCustomRepository([BuyDipRepository, OrderRepository]),
        BinanceApiModule,
        OkxApiModule
    ],
    controllers: [],
    providers: [BuyDailyTask, BuyDipTask, NewListingTask],
    exports: []
})
export class TaskModule {}
