import { Module } from '@nestjs/common';
import { OkxOrderService } from './services/okx-order.service';
import { OkxApiEarnService } from './services/okx-api-earn.service';
import { OkxApiTradeService } from './services/okx-api-trade.service';

@Module({
    imports: [],
    controllers: [],
    providers: [OkxApiEarnService, OkxApiTradeService, OkxOrderService],
    exports: [OkxOrderService]
})
export class OkxApiModule {}
