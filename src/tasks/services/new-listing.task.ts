import { Side } from '@binance/connector-typescript';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BinanceApiTradeService } from '~binance-api/services/binance-api-trade.service';

@Injectable()
export class NewListingTask {
    constructor(private binanceApiTradeService: BinanceApiTradeService) {}

    // @Cron(CronExpression.EVERY_10_SECONDS)
    async buyAndSellNewListing(): Promise<void> {
        // USDT
        this.binanceApiTradeService.retryNewOrder(
            {
                symbol: 'AEVOUSDT',
                side: Side.BUY,
                price: 0.05,
                quantity: 1000
            },
            0
        );
        this.binanceApiTradeService.retryNewOrder(
            {
                symbol: 'AEVOUSDT',
                side: Side.BUY,
                price: 0.1,
                quantity: 1000
            },
            0
        );
        this.binanceApiTradeService.retryNewOrder(
            {
                symbol: 'AEVOUSDT',
                side: Side.BUY,
                price: 0.2,
                quantity: 1000
            },
            0
        );
        this.binanceApiTradeService.retryNewOrder(
            {
                symbol: 'AEVOUSDT',
                side: Side.BUY,
                price: 0.3,
                quantity: 1000
            },
            0
        );

        this.binanceApiTradeService.retryNewOrder(
            {
                symbol: 'AEVOUSDT',
                side: Side.SELL,
                price: 10,
                quantity: 10
            },
            0
        );
        this.binanceApiTradeService.retryNewOrder(
            {
                symbol: 'AEVOUSDT',
                side: Side.SELL,
                price: 15,
                quantity: 7
            },
            0
        );

        // FDUSD
        this.binanceApiTradeService.retryNewOrder(
            {
                symbol: 'AEVOFDUSD',
                side: Side.BUY,
                price: 0.05,
                quantity: 1000
            },
            0
        );
        this.binanceApiTradeService.retryNewOrder(
            {
                symbol: 'AEVOFDUSD',
                side: Side.BUY,
                price: 0.1,
                quantity: 1000
            },
            0
        );
        this.binanceApiTradeService.retryNewOrder(
            {
                symbol: 'AEVOFDUSD',
                side: Side.BUY,
                price: 0.2,
                quantity: 1000
            },
            0
        );
        this.binanceApiTradeService.retryNewOrder(
            {
                symbol: 'AEVOFDUSD',
                side: Side.BUY,
                price: 0.3,
                quantity: 1000
            },
            0
        );

        this.binanceApiTradeService.retryNewOrder(
            {
                symbol: 'AEVOFDUSD',
                side: Side.SELL,
                price: 10,
                quantity: 10
            },
            0
        );
        this.binanceApiTradeService.retryNewOrder(
            {
                symbol: 'AEVOFDUSD',
                side: Side.SELL,
                price: 15,
                quantity: 7
            },
            0
        );
    }
}
