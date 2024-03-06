import { Injectable } from '@nestjs/common';
import { BinanceApiSimpleEarnService } from './binance-api-simple-earn.service';
import { RedeemThenOrderParam } from '~binance-api/types/redeem-then-order.param';
import { BinanceApiTradeService } from './binance-api-trade.service';
import { Side } from '@binance/connector-typescript';

@Injectable()
export class BinanceApiOrderService {
    constructor(
        private binanceApiSimpleEarnService: BinanceApiSimpleEarnService,
        private binanceApiTradeService: BinanceApiTradeService
    ) {}

    async redeemThenOrder(redeemThenOrderParam: RedeemThenOrderParam): Promise<void> {
        const { symbol, price, quantity } = redeemThenOrderParam;
        try {
            await this.binanceApiSimpleEarnService.redeemUSDT(price * quantity * 1.002);
            await this.binanceApiTradeService.newLimitOrder({
                symbol,
                side: Side.BUY,
                price,
                quantity
            });
        } catch (error) {
            console.error('RedeemThenOrder error:', error);
        }
    }
}
