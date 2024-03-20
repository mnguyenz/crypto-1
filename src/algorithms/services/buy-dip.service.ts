import { Injectable } from '@nestjs/common';
import { BinanceOrderService } from '~binance-api/services/binance-order.service';
import { BINANCE_SYMBOLS, OKX_SYMBOLS } from '~core/constants/crypto-code.constant';
import { Exchanges } from '~core/enums/exchanges.enum';
import { OkxOrderService } from '~okx-api/services/okx-order.service';
import { SELL_WHEN_PRICE_COMPARE_ORDER } from '~orders/constants/order.constant';
import { BuyDipRepository } from '~repositories/buy-dip.repository';

@Injectable()
export class BuyDipService {
    constructor(
        private buydipRepository: BuyDipRepository,
        private binanceOrderService: BinanceOrderService,
        private okxOrderService: OkxOrderService
    ) {}

    async checkBuyDip(exchange: Exchanges, data: any): Promise<void> {
        let symbol: string;
        let currentPrice: number;
        let averagePrice: number;
        if (exchange === Exchanges.BINANCE) {
            symbol = data.s;
            currentPrice = data.c;
            averagePrice = data.w;
        }
        const buyDip = await this.buydipRepository.findOne({
            where: { symbol },
            order: { percentageDecrease: 'ASC' }
        });
        if (!buyDip) {
            return;
        }
        if (currentPrice < averagePrice * (1 - buyDip.percentageDecrease / 100)) {
            this.buydipRepository.softDelete({ symbol, percentageDecrease: buyDip.percentageDecrease });
            this.buyDip(symbol, currentPrice);
        }
    }

    buyDip(symbol: string, currentPrice: number): Promise<void> {
        const price = currentPrice * SELL_WHEN_PRICE_COMPARE_ORDER;
        let quantity;
        switch (symbol) {
            case BINANCE_SYMBOLS.BTCUSDT:
                quantity = 0.001;
                symbol = OKX_SYMBOLS.BTCUSDT;
                return this.okxOrderService.redeemUSDThenOrder({
                    symbol,
                    price,
                    quantity
                });
            case BINANCE_SYMBOLS.ETHUSDT:
                quantity = 0.018;
                symbol = OKX_SYMBOLS.ETHUSDT;
                return this.okxOrderService.redeemUSDThenOrder({
                    symbol,
                    price,
                    quantity
                });
            case BINANCE_SYMBOLS.SOLUSDT:
                quantity = 0.4;
                return this.binanceOrderService.redeemUSDThenOrder({
                    symbol,
                    price,
                    quantity
                });
            default:
                return;
        }
    }
}
