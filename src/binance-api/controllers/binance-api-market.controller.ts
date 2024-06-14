import { Interval } from '@binance/connector-typescript';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BinanceApiMarketService } from '~binance-api/services/binance-api-market.service';

@Controller('binance-api/market')
@ApiTags('Binance API Market')
export class BinanceApiMarketController {
    constructor(private binanceApiMarketService: BinanceApiMarketService) {}

    @Get('get-k-lines')
    getExchangeInfo(@Query('symbol') symbol: string, @Query('interval') interval: Interval): Promise<void> {
        return this.binanceApiMarketService.getKLinesAndSaveToDB(symbol, interval);
    }
}
