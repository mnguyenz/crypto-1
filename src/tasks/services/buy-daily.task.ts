import { Side } from '@binance/connector-typescript';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IsNull, Not } from 'typeorm';
import { BinanceApiMarketService } from '~binance-api/services/binance-api-market.service';
import { BinanceOrderService } from '~binance-api/services/binance-order.service';
import { ASSETS, OKX_SYMBOLS } from '~core/constants/crypto-code.constant';
import { OrderStrategy } from '~core/enums/order-strategy.enum';
import { OkxApiEarnService } from '~okx-api/services/okx-api-earn.service';
import { OkxApiMarketService } from '~okx-api/services/okx-api-market.service';
import { OkxOrderService } from '~okx-api/services/okx-order.service';
import { OrderRepository } from '~repositories/order.repository';
import {
    GAP_DCA,
    MAX_BTC_PRICE,
    MAX_BTC_PRICE_2,
    MAX_CRYPTO_PRICE,
    MAX_ETH_PRICE,
    MAX_ETH_PRICE_2,
    OKX_BUY_FEE_COMPENSATION,
    OKX_MIN_BUY_BTC,
    OKX_MIN_BUY_ETH
} from '~tasks/constants/buy-daily.constant';

@Injectable()
export class BuyDailyTask {
    constructor(
        private binanceApiMarketService: BinanceApiMarketService,
        private binanceOrderService: BinanceOrderService,
        private okxApiMarketService: OkxApiMarketService,
        private okxOrderService: OkxOrderService,
        private okxApiEarnService: OkxApiEarnService,
        private orderRepository: OrderRepository
    ) {}

    @Cron(CronExpression.EVERY_HOUR)
    async OKXbuyETH(): Promise<void> {
        const symbol = OKX_SYMBOLS.ETHUSDT;
        const okxOrderBook = await this.okxApiMarketService.getOrderBook(symbol, 4);
        const currentPrice = okxOrderBook.bids[3][0];
        let quantity = 0;
        if (currentPrice <= MAX_ETH_PRICE_2) {
            quantity = OKX_MIN_BUY_ETH * 1.5;
        } else if (currentPrice <= MAX_ETH_PRICE) {
            quantity = OKX_MIN_BUY_ETH * OKX_BUY_FEE_COMPENSATION;
        }
        if (quantity > 0) {
            this.okxOrderService.redeemUSDThenOrder({
                symbol,
                price: currentPrice,
                quantity
            });
        }
    }

    @Cron(CronExpression.EVERY_2_HOURS)
    async OKXbuyBTC(): Promise<void> {
        const symbol = OKX_SYMBOLS.BTCUSDT;
        const okxOrderBook = await this.okxApiMarketService.getOrderBook(symbol, 4);
        const currentPrice = okxOrderBook.bids[3][0];
        let quantity = 0;
        if (currentPrice <= MAX_BTC_PRICE_2) {
            quantity = OKX_MIN_BUY_BTC * 1.5;
        } else if (currentPrice <= MAX_BTC_PRICE) {
            quantity = OKX_MIN_BUY_BTC;
        }
        if (quantity > 0) {
            this.okxOrderService.redeemUSDThenOrder({
                symbol,
                price: currentPrice,
                quantity
            });
        }
    }

    // @Cron(CronExpression.EVERY_10_SECONDS)
    // async BinanceBuyCryptos(): Promise<void> {
    //     const assets = [
    //         ASSETS.CRYPTO.SOL,
    //         ASSETS.CRYPTO.STRK,
    //         ASSETS.CRYPTO.ARB,
    //         ASSETS.CRYPTO.OP,
    //         ASSETS.CRYPTO.PIXEL,
    //         ASSETS.CRYPTO.DOT
    //     ];
    //     for (const asset of assets) {
    //         const buyOrders = await this.orderRepository.find({
    //             where: { asset, side: Side.BUY, strategy: OrderStrategy.DAILY, deletedAt: Not(IsNull()) },
    //             withDeleted: true,
    //             order: { price: 'ASC' }
    //         });
    //         const symbol = `${asset}${ASSETS.FIAT.USDT}`;
    //         const binanceOrderBook = await this.binanceApiMarketService.getOrderBook(symbol, 3);
    //         const currentPrice = binanceOrderBook.bids[2][0];
    //         if (!buyOrders.length && currentPrice <= MAX_CRYPTO_PRICE[asset]) {
    //             this.binanceOrderService.buyMin(asset, currentPrice);
    //         } else if (buyOrders.length) {
    //             const maxPrice = buyOrders[buyOrders.length - 1].price;
    //             const allowPrice = maxPrice * (1 - buyOrders.length * GAP_DCA);
    //             if (currentPrice <= allowPrice) {
    //                 this.binanceOrderService.buyMin(asset, currentPrice);
    //             }
    //         }
    //     }
    // }

    @Cron(CronExpression.EVERY_30_MINUTES)
    async purchaseSavingOKX(): Promise<void> {
        this.okxApiEarnService.purchaseMaxToSaving(ASSETS.CRYPTO.ETH);
        this.okxApiEarnService.purchaseMaxToSaving(ASSETS.CRYPTO.BTC);
    }
}
