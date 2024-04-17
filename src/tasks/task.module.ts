import { Module } from '@nestjs/common';
import { NewListingTask } from './services/new-listing.task';
import { BinanceApiModule } from '~binance-api/binance-api.module';
import { TypeOrmHelperModule } from '~core/modules/typeorm-module.module';
import { BuyDipRepository } from '~repositories/buy-dip.repository';
import { BuyDipTask } from './services/buy-dip.task';
import { OkxApiModule } from '~okx-api/okx-api.module';
import { BuyDailyTask } from './services/buy-daily.task';
import { OrderRepository } from '~repositories/order.repository';
import { TradeModule } from '~trades/trade.module';
import { AverageCalculationModule } from '~average-calculation/average-calculation.module';

@Module({
    imports: [
        TypeOrmHelperModule.forCustomRepository([BuyDipRepository, OrderRepository]),
        AverageCalculationModule,
        BinanceApiModule,
        OkxApiModule,
        TradeModule
    ],
    controllers: [],
    providers: [BuyDailyTask, BuyDipTask, NewListingTask],
    exports: []
})
export class TaskModule {}
