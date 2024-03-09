import { Module } from '@nestjs/common';
import { OkxOrderService } from './services/okx-order.service';
import { OkxApiEarnService } from './services/okx-api-earn.service';
import { OkxApiTradeService } from './services/okx-api-trade.service';
import { OkxApiMarketService } from './services/okx-api-market.service';

@Module({
    imports: [],
    controllers: [],
    providers: [OkxApiEarnService, OkxApiMarketService, OkxOrderService, OkxApiTradeService],
    exports: [OkxApiMarketService, OkxOrderService]
})
export class OkxApiModule {}
