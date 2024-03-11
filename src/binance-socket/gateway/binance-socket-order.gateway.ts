import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Side, WebsocketStream } from '@binance/connector-typescript';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Exchanges } from '~core/enums/exchanges.enum';
import { BinanceOrderService } from '~binance-api/services/binance-order.service';
import { OrderSocketService } from '~orders/services/order-socket.service';

@Injectable()
export class BinanceSocketOrderGateway implements OnModuleInit {
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private binanceOrderService: BinanceOrderService,
        private client: WebsocketStream,
        private orderSocketService: OrderSocketService
    ) {}

    async onModuleInit() {
        const callbacks = {
            open: () => console.info('Connected to BinanceSocketOrderGateway'),
            close: () => console.error('Disconnected from BinanceSocketOrderGateway'),
            message: (data: any) => {
                this.orderSocketService.checkOrderPrice(Exchanges.BINANCE, JSON.parse(data));
            }
        };

        this.client = new WebsocketStream({ callbacks });
        const [buyOrders, sellOrders] = await Promise.all([
            this.orderSocketService.setOrders(Side.BUY, Exchanges.BINANCE),
            this.orderSocketService.setOrders(Side.SELL, Exchanges.BINANCE)
        ]);
        const distinctSymbols = [...new Set([...buyOrders, ...sellOrders].map((order) => order.symbol))];
        for (const symbol of distinctSymbols) {
            this.client.miniTicker(symbol);
        }
    }
}
