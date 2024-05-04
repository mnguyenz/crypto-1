import { Injectable } from '@nestjs/common';
import { BinanceApiSimpleEarnService } from './binance-api-simple-earn.service';
import { BinanceApiTradeService } from './binance-api-trade.service';
import { Side } from '@binance/connector-typescript';
import { round, roundUp } from '~core/utils/number.util';
import { ASSETS } from '~core/constants/crypto-code.constant';
import { REDEEM_REDUNDENCY } from '~orders/constants/order.constant';
import { BINANCE_CLIENT } from '~core/constants/binance.constant';
import { BinanceFilterType } from '~binance-api/enums/binance-filter-type.enum';
import { countDecimalPlaces } from '~core/utils/string.util';
import { RedeemUsdThenOrderParam } from '~core/types/redeem-usd-then-order.param';
import { RedeemCryptoThenOrderParam } from '~core/types/redeem-crypto-then-order.param';

@Injectable()
export class BinanceOrderService {
    constructor(
        private binanceApiSimpleEarnService: BinanceApiSimpleEarnService,
        private binanceApiTradeService: BinanceApiTradeService
    ) {}

    async redeemUsdThenOrder(redeemThenOrderParam: RedeemUsdThenOrderParam): Promise<void> {
        const { symbol, price, quantity } = redeemThenOrderParam;
        let asset;
        if (symbol.endsWith(ASSETS.FIAT.USDT)) {
            asset = ASSETS.FIAT.USDT;
        } else if (symbol.endsWith(ASSETS.FIAT.FDUSD)) {
            asset = ASSETS.FIAT.FDUSD;
        }
        try {
            await this.binanceApiSimpleEarnService.redeem(asset, roundUp(price * quantity * REDEEM_REDUNDENCY, 8));
            await this.binanceApiTradeService.newLimitOrder({
                symbol,
                side: Side.BUY,
                price,
                quantity
            });
        } catch (error) {
            console.error('redeemUsdThenOrder Binance error:', error);
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

    async redeemCryptoThenOrder(redeemThenOrderParam: RedeemCryptoThenOrderParam): Promise<void> {
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

    async buyMin(symbol: string, currentPrice: number): Promise<void> {
        const exchangeInformation = await BINANCE_CLIENT.exchangeInformation({ symbol });
        const filters = exchangeInformation.symbols[0].filters;
        const { tickSize } = filters.find((filter) => filter.filterType === BinanceFilterType.PRICE_FILTER) as any;
        const { stepSize } = filters.find((filter) => filter.filterType === BinanceFilterType.LOT_SIZE) as any;
        const { minNotional } = filters.find((filter) => filter.filterType === BinanceFilterType.NOTIONAL) as any;
        const orderPrice = round(currentPrice, countDecimalPlaces(tickSize));
        const quantity = roundUp(minNotional / orderPrice, countDecimalPlaces(stepSize));
        this.redeemUsdThenOrder({
            symbol,
            price: currentPrice,
            quantity
        });
    }
}
