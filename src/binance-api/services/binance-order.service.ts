import { Injectable } from '@nestjs/common';
import { BinanceApiSimpleEarnService } from './binance-api-simple-earn.service';
import { RedeemThenOrderParam } from '~core/types/redeem-then-order.param';
import { BinanceApiTradeService } from './binance-api-trade.service';
import { Side } from '@binance/connector-typescript';
import { roundUp } from '~core/utils/number.util';
import { ASSETS } from '~core/constants/crypto-code.constant';
import { BINANCE_CLIENT } from '~core/constants/binance.constant';
import { REDEEM_REDUNDENCY } from '~orders/constants/order.constant';

@Injectable()
export class BinanceOrderService {
    constructor(
        private binanceApiSimpleEarnService: BinanceApiSimpleEarnService,
        private binanceApiTradeService: BinanceApiTradeService
    ) {}

    async redeemUSDThenOrder(redeemThenOrderParam: RedeemThenOrderParam): Promise<void> {
        const { symbol, asset, price, quantity } = redeemThenOrderParam;
        try {
            await this.binanceApiSimpleEarnService.redeem(asset, roundUp(price * quantity * REDEEM_REDUNDENCY, 8));
            await this.binanceApiTradeService.newLimitOrder({
                symbol,
                side: Side.BUY,
                price,
                quantity
            });
        } catch (error) {
            console.error('redeemUSDThenOrder Binance error:', error);
            if (asset === ASSETS.FIAT.FDUSD) {
                await this.binanceApiSimpleEarnService.redeem(
                    ASSETS.FIAT.USDT,
                    roundUp(price * quantity * REDEEM_REDUNDENCY, 8)
                );
                await this.binanceApiTradeService.newLimitOrder({
                    symbol: symbol.replace(/FDUSD$/, 'USDT'),
                    side: Side.BUY,
                    price,
                    quantity
                });
            }
        }
    }

    async redeemCryptoThenOrder(redeemThenOrderParam: RedeemThenOrderParam): Promise<void> {
        const { symbol, asset, price, quantity } = redeemThenOrderParam;
        try {
            await this.binanceApiSimpleEarnService.redeem(asset, quantity);
            await this.binanceApiTradeService.newLimitOrder({
                symbol,
                side: Side.SELL,
                price,
                quantity
            });
        } catch (error) {
            console.error('redeemCryptoThenOrder Binance error:', error);
        }
    }
}
