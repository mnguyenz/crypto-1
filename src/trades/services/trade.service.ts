import { Side } from '@binance/connector-typescript';
import { Injectable } from '@nestjs/common';
import { HistoricOrder } from 'okx-api';
import { OKX_REST_PRIVATE_CLIENT } from '~core/constants/okx.constant';
import { Exchanges } from '~core/enums/exchanges.enum';
import { TradeEntity } from '~entities/trade.entity';
import { TradeRepository } from '~repositories/trade.repository';

@Injectable()
export class TradeService {
    constructor(private tradeRepository: TradeRepository) {}

    async seedTrades(symbol: string, exchange: Exchanges): Promise<void> {
        if (exchange === Exchanges.OKX) {
            let allOrders: HistoricOrder[] = [];
            let hasMoreData = true;
            const seededTrades = await this.tradeRepository.find({
                where: {
                    symbol,
                    exchange
                },
                order: {
                    tradeTime: 'DESC'
                }
            });
            let after: string = undefined;
            const before = seededTrades.length > 0 ? seededTrades[0].orderIdReference : undefined;
            while (hasMoreData) {
                const ordersChunk = await this.okxGetOrderHistory(symbol, after, before);
                if (ordersChunk.length > 0) {
                    allOrders = allOrders.concat(ordersChunk);
                    after = ordersChunk[ordersChunk.length - 1].ordId;
                } else {
                    hasMoreData = false;
                }
            }
            const trades: TradeEntity[] = allOrders.map(
                (order: HistoricOrder) =>
                    ({
                        orderIdReference: order.ordId,
                        tradeTime: BigInt(order.fillTime),
                        asset: order.instId.split('-')[0],
                        symbol: order.instId,
                        side: order.side === 'buy' ? Side.BUY : Side.SELL,
                        price: parseFloat(order.fillPx),
                        quantity: parseFloat(order.fillSz),
                        fee: parseFloat(order.fee.substring(1)),
                        feeAsset: order.feeCcy,
                        exchange: Exchanges.OKX
                    }) as TradeEntity
            );
            await this.tradeRepository.upsert(trades, ['orderIdReference', 'exchange']);
        }
    }

    okxGetOrderHistory(instId: string, after?: string, before?: string): Promise<HistoricOrder[]> {
        return OKX_REST_PRIVATE_CLIENT.getOrderHistoryArchive({ instType: 'SPOT', instId, after, before });
    }
}
