import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { WebsocketClient } from 'okx-api';
import { Side } from '@binance/connector-typescript';
import { Exchanges } from '~core/enums/exchanges.enum';
import { OrderSocketService } from '~orders/services/order-socket.service';

@Injectable()
export class OkxSocketOrderGateway implements OnModuleInit {
    private client: WebsocketClient;

    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private orderSocketService: OrderSocketService
    ) {}

    async onModuleInit() {
        this.client = new WebsocketClient({});
        this.client.on('update', (data) => {
            this.orderSocketService.checkOrderPrice(Exchanges.OKX, data);
        });
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
}
