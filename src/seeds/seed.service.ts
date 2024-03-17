import { Injectable } from '@nestjs/common';
import { BINANCE_MONITOR_SYMBOLS, BUY_DIP_PERCENTAGES } from '~core/constants/monitor-symbols.constant';
import { Exchanges } from '~core/enums/exchanges.enum';
import { BuyDipRepository } from '~repositories/buy-dip.repository';

@Injectable()
export class SeedService {
    constructor(private buyDipRepository: BuyDipRepository) {}

    async seedBuyDip() {
        try {
            for (const symbol of BINANCE_MONITOR_SYMBOLS) {
                for (const num of BUY_DIP_PERCENTAGES) {
                    this.buyDipRepository.upsert(
                        { symbol: symbol, percentageDecrease: num, exchange: Exchanges.BINANCE },
                        ['symbol', 'percentageDecrease']
                    );
                }
            }
            return 'Seed Buy Dip data success!';
        } catch (err) {
            return `Error when seed data: ${err}`;
        }
    }
}
