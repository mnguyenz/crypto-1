import { Module } from '@nestjs/common';
import { BinanceApiMarketService } from './services/binance-api-market.service';
import { BinanceApiOrderService } from './services/binance-api-order.service';
import { BinanceApiSimpleEarnService } from './services/binance-api-simple-earn.service';
import { BinanceApiTradeService } from './services/binance-api-trade.service';

@Module({
    imports: [],
    controllers: [],
    providers: [BinanceApiMarketService, BinanceApiOrderService, BinanceApiSimpleEarnService, BinanceApiTradeService],
    exports: [BinanceApiOrderService]
})
export class BinanceApiModule {}
