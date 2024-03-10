import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { OrderRepository } from '~orders/order.repository';
import { WebsocketClient, WsDataEvent } from 'okx-api';
import { OrderEntity } from '~entities/order.entity';
import { Side } from '@binance/connector-typescript';
import { Exchanges } from '~core/enums/exchanges.enum';
import { OKX_BUY_ORDERS, OKX_SELL_ORDERS } from '~core/constants/cache-manager.constant';
import { OkxOrderService } from '~okx-api/services/okx-order.service';
import { OrderSocketService } from '~orders/services/order-socket.service';

@Injectable()
export class OkxSocketOrderGateway implements OnModuleInit {
    private client: WebsocketClient;

    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private orderRepository: OrderRepository,
        private orderSocketService: OrderSocketService,
        private okxOrderService: OkxOrderService
    ) {}

    async onModuleInit() {
        this.client = new WebsocketClient({});
        this.client.on('update', (data) => this.checkPrice(data));
        const [buyOrders, sellOrders] = await Promise.all([
            this.orderSocketService.setOrders(Side.BUY, Exchanges.OKX),
            this.orderSocketService.setOrders(Side.SELL, Exchanges.OKX)
        ]);
        const distinctSymbols = [...new Set([...buyOrders, ...sellOrders].map((order) => order.symbol))];
        for (const symbol of distinctSymbols) {
            this.client.subscribe({
                channel: 'tickers',
                instId: symbol
            });
        }
    }

    async checkPrice(data: WsDataEvent<any>): Promise<void> {
        if (!(await this.cacheManager.get(OKX_BUY_ORDERS))) {
            this.orderSocketService.setOrders(Side.BUY, Exchanges.OKX);
        }
        if (!(await this.cacheManager.get(OKX_SELL_ORDERS))) {
            this.orderSocketService.setOrders(Side.SELL, Exchanges.OKX);
        }
        const { instId: symbol, bidPx: currentPrice } = data.data[0];
        const order = ((await this.cacheManager.get(OKX_BUY_ORDERS)) as OrderEntity[]).filter((order) => {
            return symbol === order.symbol && currentPrice <= order.price * 1.002;
        });
        if (order.length) {
            const matchOrder = order[0];
            const updatedOrders = ((await this.cacheManager.get(OKX_BUY_ORDERS)) as OrderEntity[]).filter(
                (order) => order.id !== matchOrder.id
            );
            await this.cacheManager.set(OKX_BUY_ORDERS, updatedOrders);
            this.okxOrderService.redeemThenOrder({ symbol, price: order[0].price, quantity: order[0].quantity });
            await this.orderRepository.softDelete({ id: matchOrder.id });
        }
    }
}
