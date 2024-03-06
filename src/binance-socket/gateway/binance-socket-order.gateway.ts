import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { OrderType, Side, WebsocketStream } from '@binance/connector-typescript';
import { SYMBOLS } from '~core/constants/crypto-code.constant';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class BinanceSocketOrderGateway implements OnModuleInit {
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private client: WebsocketStream
    ) {}

    async onModuleInit() {
        const callbacks = {
            open: () => console.info('Connected to BinanceSocketOrderGateway'),
            close: () => console.error('Disconnected from BinanceSocketOrderGateway'),
            message: (data: any) => this.checkPrice(JSON.parse(data))
        };

        this.client = new WebsocketStream({ callbacks });
        this.client.miniTicker(SYMBOLS.PROSUSDT);
        this.client.miniTicker(SYMBOLS.NFPUSDT);
    }

    async checkPrice(data: any) {
        // const { s: symbol, c: currentPrice } = data;
        // if (
        //     symbol === SYMBOLS.NFPUSDT &&
        //     parseFloat(currentPrice) < 0.78 &&
        //     !(await this.cacheManager.get(`isBuy${SYMBOLS.NFPUSDT}`))
        // ) {
        //     await this.binanceApiSimpleEarnService.redeemUSDT(78);
        //     await this.binanceApiTradeService.newOrder({
        //         symbol: SYMBOLS.NFPUSDT,
        //         side: Side.BUY,
        //         type: OrderType.LIMIT,
        //         price: 0.775,
        //         quantity: 100
        //     });
        //     await this.cacheManager.set(`isBuy${SYMBOLS.NFPUSDT}`, true, 0);
        // }
        // if (
        //     symbol === SYMBOLS.PROSUSDT &&
        //     parseFloat(currentPrice) < 0.54 &&
        //     !(await this.cacheManager.get(`isBuy${SYMBOLS.PROSUSDT}`))
        // ) {
        //     await this.binanceApiSimpleEarnService.redeemUSDT(108);
        //     await this.binanceApiTradeService.newOrder({
        //         symbol: SYMBOLS.PROSUSDT,
        //         side: Side.BUY,
        //         type: OrderType.LIMIT,
        //         price: 0.535,
        //         quantity: 200
        //     });
        //     await this.cacheManager.set(`isBuy${SYMBOLS.PROSUSDT}`, true, 0);
        // }
    }
}
