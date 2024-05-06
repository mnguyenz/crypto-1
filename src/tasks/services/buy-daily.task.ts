import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AverageCalculationService } from '~average-calculation/services/average-calculation.service';
import { BinanceApiSimpleEarnService } from '~binance-api/services/binance-api-simple-earn.service';
import { ASSETS, OKX_SYMBOLS } from '~core/constants/crypto-code.constant';
import { Exchanges } from '~core/enums/exchanges.enum';
import { randomPercentage } from '~core/utils/random.util';
import { OkxApiEarnService } from '~okx-api/services/okx-api-earn.service';
import { OkxApiMarketService } from '~okx-api/services/okx-api-market.service';
import { OkxOrderService } from '~okx-api/services/okx-order.service';
import { OKX_BUY_FEE_COMPENSATION, OKX_MIN_BUY_BTC, OKX_MIN_BUY_ETH } from '~tasks/constants/buy-daily.constant';
import { TradeService } from '~trades/services/trade.service';

@Injectable()
export class BuyDailyTask {
    constructor(
        private averageCalculationService: AverageCalculationService,
        private binanceApiSimpleEarnService: BinanceApiSimpleEarnService,
        private okxApiMarketService: OkxApiMarketService,
        private okxOrderService: OkxOrderService,
        private okxApiEarnService: OkxApiEarnService,
        private tradeService: TradeService
    ) {}

    @Cron(CronExpression.EVERY_2_HOURS)
    async OKXbuyBTC(): Promise<void> {
        const symbol = OKX_SYMBOLS.BTCUSDT;
        await this.tradeService.seedTrades(symbol, Exchanges.OKX);
        const dca = await this.averageCalculationService.getDCA(symbol, Exchanges.OKX);
        const okxOrderBook = await this.okxApiMarketService.getOrderBook(symbol, 4);
        const currentPrice = okxOrderBook.bids[3][0];
        let quantity = 0;
        if (currentPrice < dca) {
            const loss = (dca - currentPrice) / currentPrice;
            quantity = OKX_MIN_BUY_BTC * (1 + loss);
        } else {
            if (randomPercentage(1, 3)) {
                quantity = OKX_MIN_BUY_BTC;
            }
        }
        if (quantity > 0) {
            this.okxOrderService.redeemUsdThenOrder({
                symbol,
                price: currentPrice,
                quantity
            });
        }
    }

    @Cron(CronExpression.EVERY_2_HOURS)
    async OKXbuyETH(): Promise<void> {
        const symbol = OKX_SYMBOLS.ETHUSDT;
        await this.tradeService.seedTrades(symbol, Exchanges.OKX);
        const dca = await this.averageCalculationService.getDCA(symbol, Exchanges.OKX);
        const okxOrderBook = await this.okxApiMarketService.getOrderBook(symbol, 4);
        const currentPrice = okxOrderBook.bids[3][0];
        let quantity = 0;
        if (currentPrice < dca) {
            const loss = (dca - currentPrice) / currentPrice;
            quantity = OKX_MIN_BUY_ETH * OKX_BUY_FEE_COMPENSATION * (1 + loss);
        } else {
            if (randomPercentage(1, 4)) {
                quantity = OKX_MIN_BUY_ETH;
            }
        }
        if (quantity > 0) {
            this.okxOrderService.redeemUsdThenOrder({
                symbol,
                price: currentPrice,
                quantity
            });
        }
    }

    @Cron(CronExpression.EVERY_30_MINUTES)
    async purchaseSavingOKX(): Promise<void> {
        this.okxApiEarnService.purchaseMaxToSaving(ASSETS.CRYPTO.ETH);
        this.okxApiEarnService.purchaseMaxToSaving(ASSETS.CRYPTO.BTC);
    }
}
