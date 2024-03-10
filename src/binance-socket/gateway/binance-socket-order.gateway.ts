import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Side, WebsocketStream } from '@binance/connector-typescript';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { OrderRepository } from '~orders/order.repository';
import { Exchanges } from '~core/enums/exchanges.enum';
import { OrderEntity } from '~entities/order.entity';
import { BinanceOrderService } from '~binance-api/services/binance-order.service';
import { BINANCE_BUY_ORDERS, BINANCE_SELL_ORDERS } from '~core/constants/cache-manager.constant';
import { OrderSocketService } from '~orders/services/order-socket.service';

@Injectable()
export class BinanceSocketOrderGateway implements OnModuleInit {
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private binanceOrderService: BinanceOrderService,
        private client: WebsocketStream,
        private orderSocketService: OrderSocketService,
        private orderRepository: OrderRepository
    ) {}

    async onModuleInit() {
        const callbacks = {
            open: () => console.info('Connected to BinanceSocketOrderGateway'),
            close: () => console.error('Disconnected from BinanceSocketOrderGateway'),
            message: (data: any) => this.checkPrice(JSON.parse(data))
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

    async checkPrice(data: any): Promise<void> {
        if (!(await this.cacheManager.get(BINANCE_BUY_ORDERS))) {
            this.orderSocketService.setOrders(Side.BUY, Exchanges.BINANCE);
        }
        if (!(await this.cacheManager.get(BINANCE_SELL_ORDERS))) {
            this.orderSocketService.setOrders(Side.SELL, Exchanges.BINANCE);
        }
        const { s: symbol, c: currentPrice } = data;
        const order = ((await this.cacheManager.get(BINANCE_BUY_ORDERS)) as OrderEntity[]).filter((order) => {
            return symbol === order.symbol && currentPrice <= order.price * 1.002;
        });
        if (order.length) {
            const matchOrder = order[0];
            const updatedOrders = ((await this.cacheManager.get(BINANCE_BUY_ORDERS)) as OrderEntity[]).filter(
                (order) => order.id !== matchOrder.id
            );
            await this.cacheManager.set(BINANCE_BUY_ORDERS, updatedOrders);
            this.binanceOrderService.redeemThenOrder({ symbol, price: order[0].price, quantity: order[0].quantity });
            await this.orderRepository.softDelete({ id: matchOrder.id });
        }
    }
}
