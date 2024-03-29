import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { InsertResult } from 'typeorm';
import { Cache } from 'cache-manager';
import { BinanceApiMarketService } from '~binance-api/services/binance-api-market.service';
import { Exchanges } from '~core/enums/exchanges.enum';
import { OrderEntity } from '~entities/order.entity';
import { CreateOrderDto } from '~orders/dtos/create-order.dto';
import { OrderRepository } from '~repositories/order.repository';
import { CompareOrderVsCurrentPriceResponse } from '~orders/responses/compare-order-vs-current-price.response';
import { OkxApiMarketService } from '~okx-api/services/okx-api-market.service';
import { OrderSocketService } from './order-socket.service';
import { Side } from '@binance/connector-typescript';
import { BINANCE_POSTFIX_SYMBOL_FDUSD, BINANCE_POSTFIX_SYMBOL_USDT } from '~core/constants/binance.constant';
import { OKX_POSTFIX_SYMBOL_USDT } from '~core/constants/okx.constant';
import { OrderStrategy } from '~core/enums/order-strategy.enum';

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
        const { asset, side, exchange } = createOrderDto;
        let currentPrice;
        let symbol;
        if (exchange === Exchanges.BINANCE) {
            const exchangeInforFDUSD = await this.binanceApiMarketService.checkIsFDUSDSymbol(asset);
            if (exchangeInforFDUSD) {
                symbol = `${asset}${BINANCE_POSTFIX_SYMBOL_FDUSD}`;
                const binanceOrderBook = await this.binanceApiMarketService.getOrderBook(symbol, 1);
                currentPrice = binanceOrderBook.bids[0][0];
            } else {
                symbol = `${asset}${BINANCE_POSTFIX_SYMBOL_USDT}`;
            }
            const binanceOrderBook = await this.binanceApiMarketService.getOrderBook(symbol, 1);
            currentPrice = binanceOrderBook.bids[0][0];
        } else if (exchange === Exchanges.OKX) {
            symbol = `${asset}${OKX_POSTFIX_SYMBOL_USDT}`;
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
        let newCacheOrderSymbol;
        if (exchange === Exchanges.BINANCE) {
            const exchangeInforFDUSD = await this.binanceApiMarketService.checkIsFDUSDSymbol(asset);
            if (exchangeInforFDUSD) {
                newCacheOrderSymbol = `${asset}${BINANCE_POSTFIX_SYMBOL_FDUSD}`;
            } else {
                newCacheOrderSymbol = `${asset}${BINANCE_POSTFIX_SYMBOL_USDT}`;
            }
        } else if (exchange === Exchanges.OKX) {
            newCacheOrderSymbol = `${asset}${OKX_POSTFIX_SYMBOL_USDT}`;
        }
        const newCacheOrder = {
            ...createOrderDto,
            symbol: newCacheOrderSymbol
        };
        await this.orderSocketService.setOrdersToCache(orders.concat(newCacheOrder), side, exchange);
        return this.orderRepository.insert(createOrderDto);
    }

    async compareOrderVsCurrentPrice(): Promise<CompareOrderVsCurrentPriceResponse[]> {
        const orders = await this.orderRepository.find({
            where: { side: Side.BUY, strategy: OrderStrategy.MANUAL }
        });
        const result: CompareOrderVsCurrentPriceResponse[] = [];
        for (const order of orders) {
            const { asset, side, price, exchange } = order;
            let currentPrice;
            let symbol;
            if (exchange === Exchanges.BINANCE) {
                const exchangeInforFDUSD = await this.binanceApiMarketService.checkIsFDUSDSymbol(asset);
                if (exchangeInforFDUSD) {
                    symbol = `${asset}${BINANCE_POSTFIX_SYMBOL_FDUSD}`;
                    const binanceOrderBook = await this.binanceApiMarketService.getOrderBook(symbol, 1);
                    currentPrice = binanceOrderBook.bids[0][0];
                } else {
                    symbol = `${asset}${BINANCE_POSTFIX_SYMBOL_USDT}`;
                }
                const binanceOrderBook = await this.binanceApiMarketService.getOrderBook(symbol, 1);
                currentPrice = binanceOrderBook.bids[0][0];
            } else if (exchange === Exchanges.OKX) {
                symbol = `${asset}${OKX_POSTFIX_SYMBOL_USDT}`;
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
