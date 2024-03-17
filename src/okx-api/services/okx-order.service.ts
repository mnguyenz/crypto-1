import { Injectable } from '@nestjs/common';
import { RedeemThenOrderParam } from '~core/types/redeem-then-order.param';
import { OkxApiEarnService } from './okx-api-earn.service';
import { roundUp } from '~core/utils/number.util';
import { OkxApiTradeService } from './okx-api-trade.service';
import { Side } from '@binance/connector-typescript';

@Injectable()
export class OkxOrderService {
    constructor(
        private okxApiEarnService: OkxApiEarnService,
        private okxApiTradeService: OkxApiTradeService
    ) {}

    async redeemUSDThenOrder(redeemThenOrderParam: RedeemThenOrderParam): Promise<void> {
        const { symbol, price, quantity } = redeemThenOrderParam;
        try {
            await this.okxApiEarnService.redeemUSDT(roundUp(price * quantity * 1.001, 8));
            await this.okxApiTradeService.newLimitOrder({
                symbol,
                side: Side.BUY,
                price,
                quantity
            });
        } catch (error) {
            console.error('RedeemThenOrder Okx error:', error);
        }
    }
}
