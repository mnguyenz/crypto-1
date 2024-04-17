import { Side } from '@binance/connector-typescript';
import { Injectable } from '@nestjs/common';
import { Exchanges } from '~core/enums/exchanges.enum';
import { TradeRepository } from '~repositories/trade.repository';

@Injectable()
export class AverageCalculationService {
    constructor(private tradeRepository: TradeRepository) {}

    async getDCA(symbol: string, exchange: Exchanges): Promise<number> {
        const trades = await this.tradeRepository.find({
            where: {
                symbol,
                exchange
            }
        });

        if (trades.length === 0) {
            return 0;
        }
        const buyTrades = trades.filter((trade) => trade.side === Side.BUY);
        let totalBuyQuantity: number = 0;
        let totalBuyAmount: number = 0;
        buyTrades.forEach((trade) => {
            const { feeAsset, asset, quantity, fee } = trade;
            if (feeAsset === asset) {
                totalBuyQuantity += quantity - fee;
            } else {
                totalBuyQuantity += trade.quantity;
            }
            totalBuyAmount += trade.quantity * trade.price;
        });

        return totalBuyAmount / totalBuyQuantity;
    }
}
