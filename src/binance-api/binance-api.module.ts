import { Module } from '@nestjs/common';
import { BinanceApiMarketService } from './services/binance-api-market.service';
import { BinanceOrderService } from './services/binance-order.service';
import { BinanceApiSimpleEarnService } from './services/binance-api-simple-earn.service';
import { BinanceApiTradeService } from './services/binance-api-trade.service';

@Module({
    imports: [],
    controllers: [],
    providers: [BinanceApiMarketService, BinanceOrderService, BinanceApiSimpleEarnService, BinanceApiTradeService],
    exports: [BinanceApiMarketService, BinanceApiTradeService, BinanceOrderService]
})
export class BinanceApiModule {}
