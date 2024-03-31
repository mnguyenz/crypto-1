import { Injectable } from '@nestjs/common';
import { BinanceApiSimpleEarnService } from './binance-api-simple-earn.service';
import { RedeemThenOrderParam } from '~core/types/redeem-then-order.param';
import { BinanceApiTradeService } from './binance-api-trade.service';
import { Side } from '@binance/connector-typescript';
import { round, roundUp } from '~core/utils/number.util';
import { ASSETS } from '~core/constants/crypto-code.constant';
import { REDEEM_REDUNDENCY } from '~orders/constants/order.constant';
import { BINANCE_CLIENT } from '~core/constants/binance.constant';
import { BinanceFilterType } from '~binance-api/enums/binance-filter-type.enum';
import { BinanceApiMarketService } from './binance-api-market.service';
import { countDecimalPlaces } from '~core/utils/string.util';
import { OrderRepository } from '~repositories/order.repository';
import { Exchanges } from '~core/enums/exchanges.enum';
import { OrderStrategy } from '~core/enums/order-strategy.enum';

@Injectable()
export class BinanceOrderService {
    constructor(
        private binanceApiMarketService: BinanceApiMarketService,
        private binanceApiSimpleEarnService: BinanceApiSimpleEarnService,
        private binanceApiTradeService: BinanceApiTradeService,
        private orderRepository: OrderRepository
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

    async buyMin(asset: string, currentPrice: number) {
        const symbol = `${asset}${ASSETS.FIAT.USDT}`;
        const exchangeInformation = await BINANCE_CLIENT.exchangeInformation({ symbol });
        const filters = exchangeInformation.symbols[0].filters;
        const { tickSize } = filters.find((filter) => filter.filterType === BinanceFilterType.PRICE_FILTER) as any;
        const { stepSize } = filters.find((filter) => filter.filterType === BinanceFilterType.LOT_SIZE) as any;
        const { minNotional } = filters.find((filter) => filter.filterType === BinanceFilterType.NOTIONAL) as any;
        const orderPrice = round(currentPrice, countDecimalPlaces(tickSize));
        const quantity = roundUp(minNotional / orderPrice, countDecimalPlaces(stepSize));
        this.redeemUSDThenOrder({
            symbol,
            price: currentPrice,
            quantity
        });
        this.orderRepository.insert({
            asset,
            side: Side.BUY,
            price: orderPrice,
            quantity,
            exchange: Exchanges.BINANCE,
            strategy: OrderStrategy.DAILY,
            deletedAt: new Date().getTime()
        });
    }
}
