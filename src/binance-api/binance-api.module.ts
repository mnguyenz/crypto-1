import { Module } from '@nestjs/common';
import { BinanceApiMarketService } from './services/binance-api-market.service';
import { BinanceOrderService } from './services/binance-order.service';
import { BinanceApiSimpleEarnService } from './services/binance-api-simple-earn.service';
import { BinanceApiTradeService } from './services/binance-api-trade.service';
import { OrderRepository } from '~repositories/order.repository';
import { TypeOrmHelperModule } from '~core/modules/typeorm-module.module';
import { KlineRepository } from '~repositories/kline.repository';
import { BinanceApiMarketController } from './controllers/binance-api-market.controller';

@Module({
    imports: [TypeOrmHelperModule.forCustomRepository([OrderRepository, KlineRepository])],
    controllers: [BinanceApiMarketController],
    providers: [BinanceApiMarketService, BinanceOrderService, BinanceApiSimpleEarnService, BinanceApiTradeService],
    exports: [BinanceApiSimpleEarnService, BinanceApiMarketService, BinanceApiTradeService, BinanceOrderService]
})
export class BinanceApiModule {}
