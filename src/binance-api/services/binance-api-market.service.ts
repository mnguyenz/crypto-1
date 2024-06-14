import { Interval } from '@binance/connector-typescript';
import { Injectable } from '@nestjs/common';
import { BINANCE_CLIENT, BINANCE_POSTFIX_SYMBOL_FDUSD } from '~core/constants/binance.constant';
import { GetOrderBookResponse } from '~orders/responses/get-order-book.response';
import { KlineRepository } from '~repositories/kline.repository';

@Injectable()
export class BinanceApiMarketService {
    constructor(private klineRepository: KlineRepository) {}

    async getOrderBook(symbol: string, limit?: number): Promise<GetOrderBookResponse> {
        const orderBookResponse = await BINANCE_CLIENT.orderBook(symbol, { limit });
        return {
            lastUpdateId: orderBookResponse.lastUpdateId,
            bids: orderBookResponse.bids.map((bid) => bid.map(Number)),
            asks: orderBookResponse.asks.map((ask) => ask.map(Number))
        };
    }

    async checkIsFDUSDSymbol(asset: string): Promise<boolean> {
        try {
            const exchangeInforFDUSD = await BINANCE_CLIENT.exchangeInformation({
                symbol: `${asset}${BINANCE_POSTFIX_SYMBOL_FDUSD}`
            });
            if (exchangeInforFDUSD) {
                return true;
            }
        } catch (error) {
            return false;
        }
    }

    async getKLinesAndSaveToDB(symbol: string, interval: Interval): Promise<void> {
        const existedKline = await this.klineRepository.findOne({
            where: { symbol, interval },
            order: { closeTime: 'DESC' }
        });
        const startTime = existedKline ? (existedKline[6] as number) + 1 : undefined;
        let endTime = Date.now() * 1000;
        while (true) {
            let klineCandlestickData = [];
            if (startTime) {
                klineCandlestickData = await BINANCE_CLIENT.klineCandlestickData(symbol, interval, {
                    startTime,
                    endTime
                });
            } else {
                klineCandlestickData = await BINANCE_CLIENT.klineCandlestickData(symbol, interval, {
                    endTime
                });
            }

            await this.upsertKLineToDB(symbol, interval, klineCandlestickData);
            if (klineCandlestickData.length === 0) {
                break;
            } else {
                endTime = (klineCandlestickData[0][0] as number) - 1;
            }
        }
    }

    async upsertKLineToDB(symbol: string, interval: Interval, klineCandlestickData: any): Promise<void> {
        for (const kLine of klineCandlestickData) {
            await this.klineRepository.upsert(
                {
                    symbol: symbol,
                    interval: interval,
                    openTime: BigInt(kLine[0]),
                    openPrice: +kLine[1],
                    highPrice: +kLine[2],
                    lowPrice: +kLine[3],
                    closePrice: +kLine[4],
                    volume: +kLine[5],
                    closeTime: BigInt(kLine[6]),
                    quoteAssetVolume: +kLine[7],
                    numberOfTrades: +kLine[8],
                    takerBuyBaseAssetVolume: +kLine[9],
                    takerBuyQuoteAssetVolume: +kLine[10]
                },
                ['symbol', 'interval', 'openTime']
            );
        }
    }
}
