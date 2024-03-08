import { Injectable } from '@nestjs/common';
import { BinanceApiSimpleEarnService } from './binance-api-simple-earn.service';
import { RedeemThenOrderParam } from '~core/types/redeem-then-order.param';
import { BinanceApiTradeService } from './binance-api-trade.service';
import { Side } from '@binance/connector-typescript';
import { roundUp } from '~core/utils/number.util';

@Injectable()
export class BinanceOrderService {
    constructor(
        private binanceApiSimpleEarnService: BinanceApiSimpleEarnService,
        private binanceApiTradeService: BinanceApiTradeService
    ) {}

    async redeemThenOrder(redeemThenOrderParam: RedeemThenOrderParam): Promise<void> {
        const { symbol, price, quantity } = redeemThenOrderParam;
        try {
            await this.binanceApiSimpleEarnService.redeemUSDT(roundUp(price * quantity * 1.001, 8));
            await this.binanceApiTradeService.newLimitOrder({
                symbol,
                side: Side.BUY,
                price,
                quantity
            });
        } catch (error) {
            console.error('RedeemThenOrder Binance error:', error);
        }
    }
}
