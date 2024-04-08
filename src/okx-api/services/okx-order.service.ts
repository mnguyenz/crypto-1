import { Injectable } from '@nestjs/common';
import { RedeemThenOrderParam } from '~core/types/redeem-then-order.param';
import { OkxApiEarnService } from './okx-api-earn.service';
import { roundUp } from '~core/utils/number.util';
import { OkxApiTradeService } from './okx-api-trade.service';
import { Side } from '@binance/connector-typescript';
import { REDEEM_REDUNDENCY } from '~orders/constants/order.constant';
import { ASSETS } from '~core/constants/crypto-code.constant';
import { OKX_REST_PRIVATE_CLIENT } from '~core/constants/okx.constant';

@Injectable()
export class OkxOrderService {
    constructor(
        private okxApiEarnService: OkxApiEarnService,
        private okxApiTradeService: OkxApiTradeService
    ) {}

    async redeemUSDThenOrder(redeemThenOrderParam: RedeemThenOrderParam): Promise<void> {
        const { symbol, price, quantity } = redeemThenOrderParam;
        try {
            await this.okxApiEarnService.redeem(ASSETS.FIAT.USDT, roundUp(price * quantity * REDEEM_REDUNDENCY, 8));
            await this.okxApiTradeService.newLimitOrder({
                symbol,
                side: Side.BUY,
                price,
                quantity
            });
        } catch (error) {
            console.error('OKX RedeemThenOrder error:', error);
        }
    }

    async redeemCryptoThenOrder(redeemThenOrderParam: RedeemThenOrderParam): Promise<void> {
        const { symbol, asset, price, quantity } = redeemThenOrderParam;
        try {
            await this.okxApiEarnService.redeem(asset, quantity);
            await this.okxApiTradeService.newLimitOrder({
                symbol,
                side: Side.SELL,
                price,
                quantity
            });
        } catch (error) {
            console.error('OKX redeemCryptoThenOrder error:', error);
        }
    }

    async buyMin(symbol: string, currentPrice: number): Promise<void> {
        const exchangeInformations = await OKX_REST_PRIVATE_CLIENT.getInstruments('SPOT', undefined, undefined, symbol);
        console.log(exchangeInformations[0].minSz);
        this.redeemUSDThenOrder({
            symbol,
            price: currentPrice,
            quantity: parseFloat(exchangeInformations[0].minSz)
        });
    }
}
