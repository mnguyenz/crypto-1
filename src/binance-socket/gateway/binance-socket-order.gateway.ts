import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Side, WebsocketStream } from '@binance/connector-typescript';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { OrderRepository } from '~orders/order.repository';
import { Exchanges } from '~core/enums/exchanges.enum';
import { OrderEntity } from '~entities/order.entity';
import { BinanceApiOrderService } from '~binance-api/services/binance-api-order.service';
import { BUY_ORDERS } from '~core/constants/cache-manager.constant';

@Injectable()
export class BinanceSocketOrderGateway implements OnModuleInit {
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private client: WebsocketStream,
        private orderRepository: OrderRepository,
        private binanceApiOrderService: BinanceApiOrderService
    ) {}

    async onModuleInit() {
        const callbacks = {
            open: () => console.info('Connected to BinanceSocketOrderGateway'),
            close: () => console.error('Disconnected from BinanceSocketOrderGateway'),
            message: (data: any) => this.checkPrice(JSON.parse(data))
        };

        this.client = new WebsocketStream({ callbacks });
        const buyOrders = await this.setBuyOrders();
        const distinctSymbols = [...new Set(buyOrders.map((order) => order.symbol))];
        for (const symbol of distinctSymbols) {
            this.client.miniTicker(symbol);
        }
    }

    async checkPrice(data: any): Promise<void> {
        if (!(await this.cacheManager.get(BUY_ORDERS))) {
            await this.setBuyOrders();
        }
        const { s: symbol, c: currentPrice } = data;
        const order = ((await this.cacheManager.get(BUY_ORDERS)) as OrderEntity[]).filter((order) => {
            return symbol === order.symbol && currentPrice <= order.price * 1.01;
        });
        if (order.length) {
            const matchOrder = order[0];
            const updatedOrders = ((await this.cacheManager.get(BUY_ORDERS)) as OrderEntity[]).filter(
                (order) => order.id !== matchOrder.id
            );
            this.cacheManager.set(BUY_ORDERS, updatedOrders);
            this.binanceApiOrderService.redeemThenOrder({ symbol, price: order[0].price, quantity: order[0].quantity });
        }
    }

    async setBuyOrders(): Promise<OrderEntity[]> {
        const buyOrders = await this.orderRepository.find({
            where: { side: Side.BUY, exchange: Exchanges.BINANCE }
        });
        await this.cacheManager.set(BUY_ORDERS, buyOrders, 0);
        return buyOrders;
    }
}
