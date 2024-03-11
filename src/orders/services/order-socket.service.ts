import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Exchanges } from '~core/enums/exchanges.enum';
import { OrderEntity } from '~entities/order.entity';
import { OrderRepository } from '~orders/order.repository';
import {
    BINANCE_BUY_ORDERS,
    BINANCE_SELL_ORDERS,
    OKX_BUY_ORDERS,
    OKX_SELL_ORDERS
} from '~core/constants/cache-manager.constant';
import { Side } from '@binance/connector-typescript';
import { BinanceOrderService } from '~binance-api/services/binance-order.service';
import { OkxOrderService } from '~okx-api/services/okx-order.service';

@Injectable()
export class OrderSocketService {
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private binanceOrderService: BinanceOrderService,
        private okxOrderService: OkxOrderService,
        private orderRepository: OrderRepository
    ) {}

    async setOrders(side: Side, exchange: Exchanges): Promise<OrderEntity[]> {
        const orders = await this.orderRepository.find({
            where: { side, exchange }
        });
        await this.setOrdersToCache(orders, side, exchange);
        return orders;
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
        const buyOrders = [
            ...((await this.cacheManager.get(OKX_BUY_ORDERS)) as OrderEntity[]),
            ...((await this.cacheManager.get(BINANCE_BUY_ORDERS)) as OrderEntity[])
        ].filter((order) => {
            return symbol === order.symbol && currentPrice <= order.price * 1.0035;
        });
        if (buyOrders.length) {
            const matchOrder = buyOrders[0];
            const { side, exchange } = matchOrder;
            const orders = await this.getOrdersFromCache(side, exchange);
            const updatedOrders = orders.filter((order) => order.id !== matchOrder.id);
            await this.setOrdersToCache(updatedOrders, side, exchange);
            if (exchange === Exchanges.BINANCE) {
                this.binanceOrderService.redeemUSDTThenOrder({
                    symbol,
                    price: matchOrder.price,
                    quantity: matchOrder.quantity
                });
            } else if (exchange === Exchanges.OKX) {
                this.okxOrderService.redeemThenOrder({
                    symbol,
                    price: matchOrder.price,
                    quantity: matchOrder.quantity
                });
            }
            await this.orderRepository.softDelete({ id: matchOrder.id });
        }

        const sellOrders = [
            ...((await this.cacheManager.get(OKX_SELL_ORDERS)) as OrderEntity[]),
            ...((await this.cacheManager.get(BINANCE_SELL_ORDERS)) as OrderEntity[])
        ].filter((order) => {
            return symbol === order.symbol && currentPrice >= order.price * 0.9965;
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
                    price: matchOrder.price,
                    quantity: matchOrder.quantity
                });
            // } else if (exchange === Exchanges.OKX) {
            //     this.okxOrderService.redeemThenOrder({
            //         symbol,
            //         price: matchOrder.price,
            //         quantity: matchOrder.quantity
            //     });
            }
            await this.orderRepository.softDelete({ id: matchOrder.id });
        }
    }

    async getOrdersFromCache(side: Side, exchange: Exchanges): Promise<OrderEntity[]> {
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
