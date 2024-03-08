import { OrderType, TimeInForce } from '@binance/connector-typescript';
import { Injectable } from '@nestjs/common';
import { NewLimitOrderParam } from '~core/types/new-limit-order.param';
import { BINANCE_CLIENT } from '~core/constants/binance.constant';

@Injectable()
export class BinanceApiTradeService {
    constructor() {}

    async newLimitOrder(newLimitOrderParam: NewLimitOrderParam): Promise<void> {
        const { symbol, side, quantity, price } = newLimitOrderParam;
        try {
            await BINANCE_CLIENT.newOrder(symbol, side, OrderType.LIMIT, {
                timeInForce: TimeInForce.GTC,
                quantity,
                price
            });
        } catch (error) {
            console.error('newOrder error:', error);
        }
    }
}
