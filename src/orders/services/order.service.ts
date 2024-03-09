import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { InsertResult } from 'typeorm';
import { Cache } from 'cache-manager';
import { BinanceApiMarketService } from '~binance-api/services/binance-api-market.service';
import { Exchanges } from '~core/enums/exchanges.enum';
import { OrderEntity } from '~entities/order.entity';
import { CreateOrderDto } from '~orders/dtos/create-order.dto';
import { OrderRepository } from '~orders/order.repository';
import { CompareOrderVsCurrentPriceResponse } from '~orders/responses/compare-order-vs-current-price.response';
import { BINANCE_BUY_ORDERS } from '~core/constants/cache-manager.constant';
import { OkxApiMarketService } from '~okx-api/services/okx-api-market.service';

@Injectable()
export class OrderService {
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private orderRepository: OrderRepository,
        private binanceApiMarketService: BinanceApiMarketService,
        private okxApiMarketService: OkxApiMarketService
    ) {}

    getOrder(exchange: Exchanges): Promise<OrderEntity[]> {
        return this.orderRepository.find({ where: { exchange } });
    }

    async createOrder(createOrderDto: CreateOrderDto): Promise<InsertResult> {
        this.cacheManager.set(
            BINANCE_BUY_ORDERS,
            ((await this.cacheManager.get(BINANCE_BUY_ORDERS)) as OrderEntity[]).concat(createOrderDto),
            0
        );
        return this.orderRepository.insert(createOrderDto);
    }

    async compareOrderVsCurrentPrice(): Promise<CompareOrderVsCurrentPriceResponse[]> {
        const orders = await this.orderRepository.find();
        const result: CompareOrderVsCurrentPriceResponse[] = [];
        for (const order of orders) {
            const { symbol, price, exchange } = order;
            if (exchange === Exchanges.BINANCE) {
                const binanceOrderBook = await this.binanceApiMarketService.getOrderBook(symbol, 1);
                const currentPrice = binanceOrderBook.bids[0][0];
                result.push({
                    symbol,
                    currentPrice,
                    orderPrice: price,
                    percentageReduction: ((currentPrice - order.price) / order.price) * 100
                });
            } else if (exchange === Exchanges.OKX) {
                console.log(symbol);
                const okxOrderBook = await this.okxApiMarketService.getOrderBook(symbol, 1);
                const currentPrice = okxOrderBook.bids[0][0];
                result.push({
                    symbol,
                    currentPrice,
                    orderPrice: price,
                    percentageReduction: ((currentPrice - order.price) / order.price) * 100
                });
            }
        }
        return result.sort((a, b) => a.percentageReduction - b.percentageReduction);
    }
}
