import { Side } from '@binance/connector-typescript';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { BinanceApiTradeService } from '~binance-api/services/binance-api-trade.service';
import { AT_6PM_59MIN_59SEC } from '~tasks/constants/cronjob.constant';
import { COIN_NAME } from '~tasks/constants/new-listing.constant';

@Injectable()
export class NewListingTask {
    constructor(private binanceApiTradeService: BinanceApiTradeService) {}

    @Cron(AT_6PM_59MIN_59SEC)
    async buyAndSellNewListing(): Promise<void> {
        // USDT
        this.binanceApiTradeService.retryNewOrder(
            {
                symbol: `${COIN_NAME}USDT`,
                side: Side.BUY,
                price: 0.2,
                quantity: 1000
            },
            0
        );
        this.binanceApiTradeService.retryNewOrder(
            {
                symbol: `${COIN_NAME}USDT`,
                side: Side.BUY,
                price: 0.3,
                quantity: 1000
            },
            0
        );
        this.binanceApiTradeService.retryNewOrder(
            {
                symbol: `${COIN_NAME}USDT`,
                side: Side.BUY,
                price: 0.4,
                quantity: 1000
            },
            0
        );
        this.binanceApiTradeService.retryNewOrder(
            {
                symbol: `${COIN_NAME}USDT`,
                side: Side.BUY,
                price: 0.5,
                quantity: 1000
            },
            0
        );

        this.binanceApiTradeService.retryNewOrder(
            {
                symbol: `${COIN_NAME}USDT`,
                side: Side.SELL,
                price: 15,
                quantity: 4
            },
            0
        );
        this.binanceApiTradeService.retryNewOrder(
            {
                symbol: `${COIN_NAME}USDT`,
                side: Side.SELL,
                price: 20,
                quantity: 3.59
            },
            0
        );

        // FDUSD
        this.binanceApiTradeService.retryNewOrder(
            {
                symbol: `${COIN_NAME}FDUSD`,
                side: Side.BUY,
                price: 0.2,
                quantity: 1000
            },
            0
        );
        this.binanceApiTradeService.retryNewOrder(
            {
                symbol: `${COIN_NAME}FDUSD`,
                side: Side.BUY,
                price: 0.3,
                quantity: 1000
            },
            0
        );
        this.binanceApiTradeService.retryNewOrder(
            {
                symbol: `${COIN_NAME}FDUSD`,
                side: Side.BUY,
                price: 0.4,
                quantity: 1000
            },
            0
        );
        this.binanceApiTradeService.retryNewOrder(
            {
                symbol: `${COIN_NAME}FDUSD`,
                side: Side.BUY,
                price: 0.5,
                quantity: 1000
            },
            0
        );

        this.binanceApiTradeService.retryNewOrder(
            {
                symbol: `${COIN_NAME}FDUSD`,
                side: Side.SELL,
                price: 15,
                quantity: 4
            },
            0
        );
        this.binanceApiTradeService.retryNewOrder(
            {
                symbol: `${COIN_NAME}FDUSD`,
                side: Side.SELL,
                price: 20,
                quantity: 3.59
            },
            0
        );
    }
}
