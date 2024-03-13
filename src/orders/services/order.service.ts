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
import { OkxApiMarketService } from '~okx-api/services/okx-api-market.service';
import { OrderSocketService } from './order-socket.service';
import { Side } from '@binance/connector-typescript';

@Injectable()
export class OrderService {
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private orderRepository: OrderRepository,
        private orderSocketService: OrderSocketService,
        private binanceApiMarketService: BinanceApiMarketService,
        private okxApiMarketService: OkxApiMarketService
    ) {}

    getOrder(exchange: Exchanges): Promise<OrderEntity[]> {
        if (exchange) {
            return this.orderRepository.find({ where: { exchange } });
        } else {
            return this.orderRepository.find();
        }
    }

    async createOrder(createOrderDto: CreateOrderDto): Promise<InsertResult> {
        const { symbol, side, exchange } = createOrderDto;
        let currentPrice;
        if (exchange === Exchanges.BINANCE) {
            const binanceOrderBook = await this.binanceApiMarketService.getOrderBook(symbol, 1);
            currentPrice = binanceOrderBook.bids[0][0];
        } else if (exchange === Exchanges.OKX) {
            const okxOrderBook = await this.okxApiMarketService.getOrderBook(symbol, 1);
            currentPrice = okxOrderBook.bids[0][0];
        }
        if (
            (side === Side.BUY && currentPrice < createOrderDto.price) ||
            (side === Side.SELL && currentPrice > createOrderDto.price)
        ) {
            return;
        }
        const orders = await this.orderSocketService.getOrdersFromCache(side, exchange);
        await this.orderSocketService.setOrdersToCache(orders.concat(createOrderDto), side, exchange);
        return this.orderRepository.insert(createOrderDto);
    }

    async compareOrderVsCurrentPrice(): Promise<CompareOrderVsCurrentPriceResponse[]> {
        const orders = await this.orderRepository.find();
        const result: CompareOrderVsCurrentPriceResponse[] = [];
        for (const order of orders) {
            const { symbol, side, price, exchange } = order;
            let currentPrice;
            if (exchange === Exchanges.BINANCE) {
                const binanceOrderBook = await this.binanceApiMarketService.getOrderBook(symbol, 1);
                currentPrice = binanceOrderBook.bids[0][0];
            } else if (exchange === Exchanges.OKX) {
                const okxOrderBook = await this.okxApiMarketService.getOrderBook(symbol, 1);
                currentPrice = okxOrderBook.bids[0][0];
            }
            let percentage;
            if (side === Side.BUY) {
                percentage = ((currentPrice - order.price) / order.price) * 100;
            } else {
                percentage = -((order.price - currentPrice) / currentPrice) * 100;
            }
            result.push({
                symbol,
                currentPrice,
                orderPrice: price,
                percentage
            });
        }
        return result.sort((a, b) => a.percentage - b.percentage);
    }
}
