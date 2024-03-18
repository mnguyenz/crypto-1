import { Injectable } from '@nestjs/common';
import { BINANCE_CLIENT, BINANCE_POSTFIX_SYMBOL_FDUSD } from '~core/constants/binance.constant';
import { GetOrderBookResponse } from '~orders/responses/get-order-book.response';

@Injectable()
export class BinanceApiMarketService {
    constructor() {}

    async getOrderBook(symbol: string, limit?: number): Promise<GetOrderBookResponse> {
        const orderBookResponse = await BINANCE_CLIENT.orderBook(symbol, { limit });
        return {
            lastUpdateId: orderBookResponse.lastUpdateId,
            bids: orderBookResponse.bids.map((bid) => bid.map(Number)),
            asks: orderBookResponse.asks.map((ask) => ask.map(Number))
        };
    }

    async checkIsFDUSDSymbol(asset: string): Promise<boolean> {
        try {
            const exchangeInforFDUSD = await BINANCE_CLIENT.exchangeInformation({
                symbol: `${asset}${BINANCE_POSTFIX_SYMBOL_FDUSD}`
            });
            if (exchangeInforFDUSD) {
                return true;
            }
        } catch (error) {
            return false;
        }
    }
}
