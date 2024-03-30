import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ASSETS, OKX_SYMBOLS } from '~core/constants/crypto-code.constant';
import { OkxApiEarnService } from '~okx-api/services/okx-api-earn.service';
import { OkxApiMarketService } from '~okx-api/services/okx-api-market.service';
import { OkxOrderService } from '~okx-api/services/okx-order.service';
import {
    MAX_BTC_PRICE,
    MAX_ETH_PRICE,
    OKX_BUY_FEE_COMPENSATION,
    OKX_MIN_BUY_BTC,
    OKX_MIN_BUY_ETH
} from '~tasks/constants/buy-daily.constant';

@Injectable()
export class BuyDailyTask {
    constructor(
        private okxApiMarketService: OkxApiMarketService,
        private okxOrderService: OkxOrderService,
        private okxApiEarnService: OkxApiEarnService
    ) {}

    @Cron(CronExpression.EVERY_2_HOURS)
    async buyETH(): Promise<void> {
        const symbol = OKX_SYMBOLS.ETHUSDT;
        const okxOrderBook = await this.okxApiMarketService.getOrderBook(symbol, 4);
        const currentPrice = okxOrderBook.bids[3][0];
        if (currentPrice <= MAX_ETH_PRICE) {
            this.okxOrderService.redeemUSDThenOrder({
                symbol,
                price: currentPrice,
                quantity: OKX_MIN_BUY_ETH * OKX_BUY_FEE_COMPENSATION
            });
        }
    }

    @Cron(CronExpression.EVERY_2_HOURS)
    async buyBTC(): Promise<void> {
        const symbol = OKX_SYMBOLS.BTCUSDT;
        const okxOrderBook = await this.okxApiMarketService.getOrderBook(symbol, 4);
        const currentPrice = okxOrderBook.bids[3][0];
        if (currentPrice <= MAX_BTC_PRICE) {
            this.okxOrderService.redeemUSDThenOrder({
                symbol,
                price: currentPrice,
                quantity: OKX_MIN_BUY_BTC
            });
        }
    }

    @Cron(CronExpression.EVERY_30_MINUTES)
    async purchaseSavingOKX(): Promise<void> {
        this.okxApiEarnService.purchaseMaxToSaving(ASSETS.CRYPTO.ETH);
        this.okxApiEarnService.purchaseMaxToSaving(ASSETS.CRYPTO.BTC);
    }
}
