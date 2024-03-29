import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Side, WebsocketStream } from '@binance/connector-typescript';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Exchanges } from '~core/enums/exchanges.enum';
import { OrderSocketService } from '~orders/services/order-socket.service';
import { BINANCE_MONITOR_SYMBOLS } from '~core/constants/monitor-symbols.constant';
import { BuyDipService } from '~algorithms/services/buy-dip.service';
import { BinanceApiMarketService } from '~binance-api/services/binance-api-market.service';
import { BINANCE_POSTFIX_SYMBOL_FDUSD, BINANCE_POSTFIX_SYMBOL_USDT } from '~core/constants/binance.constant';

@Injectable()
export class BinanceSocketOrderGateway implements OnModuleInit {
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private streamClient: WebsocketStream,
        private streamClientTicker: WebsocketStream,
        private binanceApiMarketService: BinanceApiMarketService,
        private orderSocketService: OrderSocketService,
        private buyDipService: BuyDipService
    ) {}

    async onModuleInit() {
        const minitickerCallbacks = {
            open: () => console.info('Connected to minitickerCallbacks BinanceSocketOrderGateway'),
            close: () => console.error('Disconnected from minitickerCallbacks BinanceSocketOrderGateway'),
            message: (data: any) => {
                this.orderSocketService.checkOrderPrice(Exchanges.BINANCE, JSON.parse(data));
            }
        };

        this.streamClient = new WebsocketStream({ callbacks: minitickerCallbacks });
        const [buyOrders, sellOrders] = await Promise.all([
            this.orderSocketService.setOrders(Side.BUY, Exchanges.BINANCE),
            this.orderSocketService.setOrders(Side.SELL, Exchanges.BINANCE)
        ]);
        const distinctAssets = [...new Set([...buyOrders, ...sellOrders].map((order) => order.asset))];
        for (const asset of distinctAssets) {
            let symbol: string;
            const exchangeInforFDUSD = await this.binanceApiMarketService.checkIsFDUSDSymbol(asset);
            if (exchangeInforFDUSD) {
                symbol = `${asset}${BINANCE_POSTFIX_SYMBOL_FDUSD}`;
            } else {
                symbol = `${asset}${BINANCE_POSTFIX_SYMBOL_USDT}`;
            }
            this.streamClient.miniTicker(symbol);
        }

        const tickerCallbacks = {
            open: () => console.info('Connected to tickerCallbacks BinanceSocketOrderGateway'),
            close: () => console.error('Disconnected from tickerCallbacks BinanceSocketOrderGateway'),
            message: (data: any) => {
                this.buyDipService.checkBuyDip(Exchanges.BINANCE, JSON.parse(data));
            }
        };
        this.streamClientTicker = new WebsocketStream({ callbacks: tickerCallbacks });
        for (const monitorSymbols of BINANCE_MONITOR_SYMBOLS) {
            this.streamClientTicker.ticker(monitorSymbols);
        }
    }
}
