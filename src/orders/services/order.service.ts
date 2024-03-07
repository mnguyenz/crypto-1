import { Injectable } from '@nestjs/common';
import { InsertResult } from 'typeorm';
import { BinanceApiMarketService } from '~binance-api/services/binance-api-market.service';
import { Exchanges } from '~core/enums/exchanges.enum';
import { OrderEntity } from '~entities/order.entity';
import { CreateOrderDto } from '~orders/dtos/create-order.dto';
import { OrderRepository } from '~orders/order.repository';
import { CompareOrderVsCurrentPriceResponse } from '~orders/responses/compare-order-vs-current-price.response';

@Injectable()
export class OrderService {
    constructor(
        private orderRepository: OrderRepository,
        private binanceApiMarketService: BinanceApiMarketService
    ) {}

    getOrder(exchange: Exchanges): Promise<OrderEntity[]> {
        return this.orderRepository.find({ where: { exchange } });
    }

    createOrder(createOrderDto: CreateOrderDto): Promise<InsertResult> {
        return this.orderRepository.insert(createOrderDto);
    }

    async compareOrderVsCurrentPrice(): Promise<CompareOrderVsCurrentPriceResponse[]> {
        const orders = await this.orderRepository.find();
        const result: CompareOrderVsCurrentPriceResponse[] = [];
        for (const order of orders) {
            const { symbol, price } = order;
            const binanceOrderBook = await this.binanceApiMarketService.getOrderBook(symbol, 1);
            const currentPrice = binanceOrderBook.bids[0][0];
            result.push({
                symbol,
                currentPrice,
                orderPrice: price,
                percentageReduction: ((currentPrice - order.price) / order.price) * 100
            });
        }
        return result.sort((a, b) => a.percentageReduction - b.percentageReduction);
    }
}
