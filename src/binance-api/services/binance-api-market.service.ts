import { Injectable } from '@nestjs/common';
import { BINANCE_CLIENT } from '~core/constants/binance.constant';
import { BinanceOrderBookResponse } from '~binance-api/types/binance-order-book.response';

@Injectable()
export class BinanceApiMarketService {
    constructor() {}

    async getOrderBook(symbol: string, limit?: number): Promise<BinanceOrderBookResponse> {
        const orderBookResponse = await BINANCE_CLIENT.orderBook(symbol, { limit });
        return {
            lastUpdateId: orderBookResponse.lastUpdateId,
            bids: orderBookResponse.bids.map((bid) => bid.map(Number)),
            asks: orderBookResponse.asks.map((ask) => ask.map(Number))
        };
    }
}
