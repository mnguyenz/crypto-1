import { Side } from '@binance/connector-typescript';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ASSETS, OKX_SYMBOLS } from '~core/constants/crypto-code.constant';
import { Exchanges } from '~core/enums/exchanges.enum';
import { OrderStrategy } from '~core/enums/order-strategy.enum';
import { round } from '~core/utils/number.util';
import { OkxApiMarketService } from '~okx-api/services/okx-api-market.service';
import { OrderRepository } from '~repositories/order.repository';
import {
    OKX_DECIMAL_PLACES_BTC,
    OKX_DECIMAL_PLACES_ETH,
    OKX_MIN_BUY_BTC,
    OKX_MIN_BUY_ETH,
    REDUCE_CURRENT_PRICE
} from '~tasks/constants/buy-daily.constant';

@Injectable()
export class BuyDailyTask {
    constructor(
        private okxApiMarketService: OkxApiMarketService,
        private orderRepository: OrderRepository
    ) {}

    @Cron(CronExpression.EVERY_2_HOURS)
    async buyETH(): Promise<void> {
        const symbol = OKX_SYMBOLS.ETHUSDT;
        const okxOrderBook = await this.okxApiMarketService.getOrderBook(symbol, 1);
        const currentPrice = okxOrderBook.bids[0][0];
        await this.orderRepository.insert({
            asset: ASSETS.CRYPTO.ETH,
            side: Side.BUY,
            price: round(currentPrice * REDUCE_CURRENT_PRICE, OKX_DECIMAL_PLACES_ETH),
            quantity: OKX_MIN_BUY_ETH,
            exchange: Exchanges.OKX,
            strategy: OrderStrategy.DAILY
        });
    }

    @Cron(CronExpression.EVERY_4_HOURS)
    async buyBTC(): Promise<void> {
        const symbol = OKX_SYMBOLS.BTCUSDT;
        const okxOrderBook = await this.okxApiMarketService.getOrderBook(symbol, 1);
        const currentPrice = okxOrderBook.bids[0][0];
        await this.orderRepository.insert({
            asset: ASSETS.CRYPTO.BTC,
            side: Side.BUY,
            price: round(currentPrice * REDUCE_CURRENT_PRICE, OKX_DECIMAL_PLACES_BTC),
            quantity: OKX_MIN_BUY_BTC,
            exchange: Exchanges.OKX,
            strategy: OrderStrategy.DAILY
        });
    }
}
