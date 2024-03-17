import { Injectable } from '@nestjs/common';
import { BinanceApiSimpleEarnService } from './binance-api-simple-earn.service';
import { RedeemThenOrderParam } from '~core/types/redeem-then-order.param';
import { BinanceApiTradeService } from './binance-api-trade.service';
import { Side } from '@binance/connector-typescript';
import { roundUp } from '~core/utils/number.util';
import { ASSETS } from '~core/constants/crypto-code.constant';
import { BINANCE_CLIENT } from '~core/constants/binance.constant';

@Injectable()
export class BinanceOrderService {
    constructor(
        private binanceApiSimpleEarnService: BinanceApiSimpleEarnService,
        private binanceApiTradeService: BinanceApiTradeService
    ) {}

    async redeemUSDThenOrder(redeemThenOrderParam: RedeemThenOrderParam): Promise<void> {
        const { symbol, price, quantity } = redeemThenOrderParam;
        try {
            if (symbol.includes(ASSETS.FIAT.USDT)) {
                await this.binanceApiSimpleEarnService.redeem(ASSETS.FIAT.USDT, roundUp(price * quantity * 1.001, 8));
            } else if (symbol.includes(ASSETS.FIAT.FDUSD)) {
                await this.binanceApiSimpleEarnService.redeem(ASSETS.FIAT.FDUSD, roundUp(price * quantity * 1.001, 8));
            }
            await this.binanceApiTradeService.newLimitOrder({
                symbol,
                side: Side.BUY,
                price,
                quantity
            });
        } catch (error) {
            console.error('redeemUSDThenOrder Binance error:', error);
        }
    }

    async redeemCryptoThenOrder(redeemThenOrderParam: RedeemThenOrderParam): Promise<void> {
        const { symbol, price, quantity } = redeemThenOrderParam;
        try {
            const exchangeInfor = await BINANCE_CLIENT.exchangeInformation({ symbol });
            const baseAsset = exchangeInfor.symbols[0].baseAsset;
            await this.binanceApiSimpleEarnService.redeem(baseAsset, quantity);
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
