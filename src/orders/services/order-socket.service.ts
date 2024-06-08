import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Exchanges } from '~core/enums/exchanges.enum';
import { OrderRepository } from '~repositories/order.repository';
import {
    BINANCE_BUY_ORDERS,
    BINANCE_SELL_ORDERS,
    OKX_BUY_ORDERS,
    OKX_SELL_ORDERS
} from '~core/constants/cache-manager.constant';
import { Side } from '@binance/connector-typescript';
import { BinanceOrderService } from '~binance-api/services/binance-order.service';
import { OkxOrderService } from '~okx-api/services/okx-order.service';
import { CacheOrder } from '~orders/types/cache-order.type';
import { BinanceApiMarketService } from '~binance-api/services/binance-api-market.service';
import { BINANCE_POSTFIX_SYMBOL_FDUSD, BINANCE_POSTFIX_SYMBOL_USDT } from '~core/constants/binance.constant';
import { OKX_POSTFIX_SYMBOL_USDT } from '~core/constants/okx.constant';
import { BUY_WHEN_PRICE_COMPARE_ORDER, SELL_WHEN_PRICE_COMPARE_ORDER } from '~orders/constants/order.constant';

@Injectable()
export class OrderSocketService {
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private binanceApiMarketService: BinanceApiMarketService,
        private binanceOrderService: BinanceOrderService,
        private okxOrderService: OkxOrderService,
        private orderRepository: OrderRepository
    ) {}

    async setOrders(side: Side, exchange: Exchanges): Promise<CacheOrder[]> {
        const orders = await this.orderRepository.find({
            where: { side, exchange }
        });
        const cachedOrders = [];
        for (const order of orders) {
            let symbol;
            if (exchange === Exchanges.BINANCE) {
                const exchangeInforFDUSD = await this.binanceApiMarketService.checkIsFDUSDSymbol(order.asset);
                if (exchangeInforFDUSD) {
                    symbol = `${order.asset}${BINANCE_POSTFIX_SYMBOL_FDUSD}`;
                } else {
                    symbol = `${order.asset}${BINANCE_POSTFIX_SYMBOL_USDT}`;
                }
            } else if (exchange === Exchanges.OKX) {
                symbol = `${order.asset}${OKX_POSTFIX_SYMBOL_USDT}`;
            }
            cachedOrders.push({
                ...order,
                symbol
            });
        }
        await this.setOrdersToCache(cachedOrders, side, exchange);
        return cachedOrders;
    }

    async checkOrderPrice(exchange: Exchanges, data: any): Promise<void> {
        if (!(await this.cacheManager.get(BINANCE_BUY_ORDERS))) {
            this.setOrders(Side.BUY, Exchanges.BINANCE);
        }
        if (!(await this.cacheManager.get(BINANCE_SELL_ORDERS))) {
            this.setOrders(Side.SELL, Exchanges.BINANCE);
        }
        if (!(await this.cacheManager.get(OKX_BUY_ORDERS))) {
            this.setOrders(Side.BUY, Exchanges.OKX);
        }
        if (!(await this.cacheManager.get(OKX_SELL_ORDERS))) {
            this.setOrders(Side.SELL, Exchanges.OKX);
        }
        let symbol: string;
        let currentPrice: number;
        if (exchange === Exchanges.BINANCE) {
            symbol = data.s;
            currentPrice = data.c;
        } else if (exchange === Exchanges.OKX) {
            symbol = data.data[0].instId;
            currentPrice = data.data[0].last;
        }
        const okxBuyOrders: CacheOrder[] = await this.cacheManager.get(OKX_BUY_ORDERS);
        const binanceBuyOrders: CacheOrder[] = await this.cacheManager.get(BINANCE_BUY_ORDERS);
        const buyOrders = [
            ...(Array.isArray(okxBuyOrders) ? okxBuyOrders : []),
            ...(Array.isArray(binanceBuyOrders) ? binanceBuyOrders : [])
        ].filter((order: CacheOrder) => {
            return (
                symbol === order.symbol &&
                currentPrice <= order.price * BUY_WHEN_PRICE_COMPARE_ORDER &&
                currentPrice > order.price
            );
        });
        if (buyOrders.length) {
            const matchOrder = buyOrders[0];
            const { side, exchange } = matchOrder;
            const orders = await this.getOrdersFromCache(side, exchange);
            const updatedOrders = orders.filter((order) => order.id !== matchOrder.id);
            await this.setOrdersToCache(updatedOrders, side, exchange);
            if (exchange === Exchanges.BINANCE) {
                this.binanceOrderService.redeemUsdThenOrder({
                    symbol,
                    price: matchOrder.price,
                    quantity: matchOrder.quantity
                });
            } else if (exchange === Exchanges.OKX) {
                this.okxOrderService.redeemUsdThenOrder({
                    symbol,
                    price: matchOrder.price,
                    quantity: matchOrder.quantity
                });
            }
            await this.orderRepository.softDelete({ id: matchOrder.id });
        }

        const okxSellOrders: CacheOrder[] = await this.cacheManager.get(OKX_SELL_ORDERS);
        const binanceSellOrders: CacheOrder[] = await this.cacheManager.get(BINANCE_SELL_ORDERS);
        const sellOrders = [
            ...(Array.isArray(okxSellOrders) ? okxSellOrders : []),
            ...(Array.isArray(binanceSellOrders) ? binanceSellOrders : [])
        ].filter((order: CacheOrder) => {
            return (
                symbol === order.symbol &&
                currentPrice >= order.price * SELL_WHEN_PRICE_COMPARE_ORDER &&
                currentPrice < order.price
            );
        });
        if (sellOrders.length) {
            const matchOrder = sellOrders[0];
            const { side, exchange } = matchOrder;
            const orders = await this.getOrdersFromCache(side, exchange);
            const updatedOrders = orders.filter((order) => order.id !== matchOrder.id);
            await this.setOrdersToCache(updatedOrders, side, exchange);
            if (exchange === Exchanges.BINANCE) {
                this.binanceOrderService.redeemCryptoThenOrder({
                    symbol,
                    asset: matchOrder.asset,
                    price: matchOrder.price,
                    quantity: matchOrder.quantity
                });
            } else if (exchange === Exchanges.OKX) {
                this.okxOrderService.redeemCryptoThenOrder({
                    symbol,
                    asset: matchOrder.asset,
                    price: matchOrder.price,
                    quantity: matchOrder.quantity
                });
            }
            await this.orderRepository.softDelete({ id: matchOrder.id });
        }
    }

    async getOrdersFromCache(side: Side, exchange: Exchanges): Promise<CacheOrder[]> {
        switch (true) {
            case side === Side.BUY && exchange === Exchanges.BINANCE:
                return (await this.cacheManager.get(BINANCE_BUY_ORDERS)) || Promise.resolve([]);
            case side === Side.SELL && exchange === Exchanges.BINANCE:
                return (await this.cacheManager.get(BINANCE_SELL_ORDERS)) || Promise.resolve([]);
            case side === Side.BUY && exchange === Exchanges.OKX:
                return (await this.cacheManager.get(OKX_BUY_ORDERS)) || Promise.resolve([]);
            case side === Side.SELL && exchange === Exchanges.OKX:
                return (await this.cacheManager.get(OKX_SELL_ORDERS)) || Promise.resolve([]);
            default:
                console.log('Error getOrdersFromCache');
                return;
        }
    }

    async setOrdersToCache(orders, side: Side, exchange: Exchanges): Promise<void> {
        switch (true) {
            case side === Side.BUY && exchange === Exchanges.BINANCE:
                await this.cacheManager.set(BINANCE_BUY_ORDERS, orders, 0);
                break;
            case side === Side.SELL && exchange === Exchanges.BINANCE:
                await this.cacheManager.set(BINANCE_SELL_ORDERS, orders, 0);
                break;
            case side === Side.BUY && exchange === Exchanges.OKX:
                await this.cacheManager.set(OKX_BUY_ORDERS, orders, 0);
                break;
            case side === Side.SELL && exchange === Exchanges.OKX:
                await this.cacheManager.set(OKX_SELL_ORDERS, orders, 0);
                break;
            default:
                console.log('Error setOrdersToCache');
                return;
        }
    }
}
