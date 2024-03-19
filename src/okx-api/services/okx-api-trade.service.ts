import { Injectable } from '@nestjs/common';
import { NewLimitOrderParam } from '~core/types/new-limit-order.param';
import { OKX_REST_PRIVATE_CLIENT } from '~core/constants/okx.constant';
import { Side } from '@binance/connector-typescript';

@Injectable()
export class OkxApiTradeService {
    constructor() {}

    async newLimitOrder(newLimitOrderParam: NewLimitOrderParam): Promise<any> {
        const { symbol, side, quantity, price } = newLimitOrderParam;
        try {
            return OKX_REST_PRIVATE_CLIENT.submitOrder({
                instId: symbol,
                tdMode: 'cash',
                side: side === Side.BUY ? 'buy' : 'sell',
                ordType: 'limit',
                sz: quantity.toString(),
                px: price.toString()
            });
        } catch (error) {
            console.error('newOrder OKX error:', error);
            return error;
        }
    }
}
