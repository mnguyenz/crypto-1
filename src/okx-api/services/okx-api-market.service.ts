import { Injectable } from '@nestjs/common';
import { OKX_REST_PRIVATE_CLIENT } from '~core/constants/okx.constant';
import { GetOrderBookResponse } from '~orders/types/get-order-book.response';

@Injectable()
export class OkxApiMarketService {
    constructor() {}

    async getOrderBook(symbol: string, limit?: number): Promise<GetOrderBookResponse> {
        try {
            const orderBookResponse = await OKX_REST_PRIVATE_CLIENT.getOrderBook(symbol, limit.toString());
            return {
                lastUpdateId: Number(orderBookResponse[0].ts),
                bids: orderBookResponse[0].bids.map((bid) => bid.map(Number)),
                asks: orderBookResponse[0].asks.map((ask) => ask.map(Number))
            };
        } catch (error) {
            console.error('Okx getOrderBook error:', error);
        }
    }
}
