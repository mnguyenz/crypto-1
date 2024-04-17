import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Exchanges } from '~core/enums/exchanges.enum';
import { TradeService } from '~trades/services/trade.service';

@Controller('trade')
@ApiTags('Trade')
export class TradeController {
    constructor(private tradeService: TradeService) {}

    @Get('seed/:symbol/:exchange')
    seedTrades(@Param('symbol') symbol: string, @Param('exchange') exchange: Exchanges): Promise<void> {
        return this.tradeService.seedTrades(symbol, exchange);
    }

    @Get('testSeed')
    testSeed(): Promise<void> {
        return this.tradeService.seedTrades('ETH-USDT', Exchanges.OKX);
    }
}
