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

@Injectable()
export class OrderSocketService {
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private orderRepository: OrderRepository
    ) {}

    async setOrders(side: Side, exchange: Exchanges): Promise<OrderEntity[]> {
        const orders = await this.orderRepository.find({
            where: { side, exchange }
        });
        await this.setOrdersToCache(orders, side, exchange);
        return orders;
    }

    async getOrdersFromCache(side: Side, exchange: Exchanges): Promise<OrderEntity[]> {
        console.log('MinhDebug getOrdersFromCache side', side);
        console.log('MinhDebug getOrdersFromCache exchange', exchange);
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
