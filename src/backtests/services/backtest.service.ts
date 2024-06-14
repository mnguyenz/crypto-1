import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { KlineRepository } from '~repositories/kline.repository';
import {
    DAILY_ADD,
    INITIAL_INVESTMENT,
    MIN_BTC_IN_PORTFOLIO,
    MIN_ETH_IN_PORTFOLIO,
    MIN_GAP_BUY_AND_SELL,
    MIN_INVESTMENT_PERIOD,
    MIN_USD_IN_PORTFOLIO,
    PRECISION
} from '~backtests/constants/mrx-1.constant';
import { BINANCE_SYMBOLS } from '~core/constants/crypto-code.constant';
import faker from 'faker';
import { BacktestRepository } from '~repositories/backtest.repository';
import { AlgorithmType } from '~algorithms/enums/algorithm-type.enum';
import { round } from '~core/utils/number.util';

@Injectable()
export class BacktestService {
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private klineRepository: KlineRepository,
        private backtestRepository: BacktestRepository
    ) {}

    async backTestMxr1(): Promise<void> {
        const btcKlines = await this.klineRepository.find({
            where: { symbol: BINANCE_SYMBOLS.BTCUSDT },
            order: { openTime: 'ASC' }
        });
        const ethKlines = await this.klineRepository.find({
            where: { symbol: BINANCE_SYMBOLS.ETHUSDT },
            order: { openTime: 'ASC' }
        });
        console.log('btcKlines length:', btcKlines.length);
        console.log('ethKlines length:', ethKlines.length);

        while (true) {
            let investment = INITIAL_INVESTMENT;
            let usdAmount = INITIAL_INVESTMENT;
            let btcAmount = 0;
            let ethAmount = 0;

            // Random Values
            const initialDay = faker.datatype.number({ min: 0, max: btcKlines.length - 1 - MIN_INVESTMENT_PERIOD });
            const endDay = faker.datatype.number({
                min: initialDay + MIN_INVESTMENT_PERIOD,
                max: btcKlines.length - 1
            });

            const keepBtcRatioInPortfolio = faker.datatype.float({
                min: MIN_BTC_IN_PORTFOLIO,
                max: 1 - MIN_ETH_IN_PORTFOLIO - MIN_USD_IN_PORTFOLIO,
                precision: PRECISION
            });

            const keepEthRatioInPortfolio = faker.datatype.float({
                min: MIN_ETH_IN_PORTFOLIO,
                max: 1 - keepBtcRatioInPortfolio - MIN_USD_IN_PORTFOLIO,
                precision: PRECISION
            });

            const buyBtcRatio = faker.datatype.float({
                min: MIN_BTC_IN_PORTFOLIO * (1 - MIN_GAP_BUY_AND_SELL),
                max: (1 - MIN_GAP_BUY_AND_SELL) * keepBtcRatioInPortfolio,
                precision: PRECISION
            });

            const sellBtcRatio = faker.datatype.float({
                min: round((1 + MIN_GAP_BUY_AND_SELL) * keepBtcRatioInPortfolio, 3),
                max: 1 - MIN_USD_IN_PORTFOLIO - MIN_ETH_IN_PORTFOLIO,
                precision: PRECISION
            });

            const buyEthRatio = faker.datatype.float({
                min: MIN_ETH_IN_PORTFOLIO * (1 - MIN_GAP_BUY_AND_SELL),
                max: (1 - MIN_GAP_BUY_AND_SELL) * keepEthRatioInPortfolio,
                precision: PRECISION
            });

            const sellEthRatio = faker.datatype.float({
                min: round((1 + MIN_GAP_BUY_AND_SELL) * keepEthRatioInPortfolio, 3),
                max: 1 - MIN_USD_IN_PORTFOLIO - MIN_BTC_IN_PORTFOLIO,
                precision: PRECISION
            });

            for (let i = initialDay; i < endDay; i++) {
                if (i > 0) {
                    investment += DAILY_ADD;
                    usdAmount += DAILY_ADD;
                }
                const btcPrice = btcKlines[i].openPrice;
                const btcValue = btcAmount * btcPrice;

                const ethPrice = ethKlines[i].openPrice;
                const ethValue = ethAmount * ethPrice;

                const portfolio = btcValue + ethValue + usdAmount;
                const btcRatio = btcValue / portfolio;
                if (btcRatio < buyBtcRatio) {
                    const targetBtcValue = keepBtcRatioInPortfolio * portfolio;
                    const usdToSpend = targetBtcValue - btcValue;
                    btcAmount += usdToSpend / btcPrice;
                    usdAmount -= usdToSpend;
                }
                if (btcRatio > sellBtcRatio) {
                    const targetBtcValue = keepBtcRatioInPortfolio * portfolio;
                    const btcToSell = (btcValue - targetBtcValue) / btcPrice;
                    btcAmount -= btcToSell;
                    usdAmount += btcToSell * btcPrice;
                }

                const ethRatio = ethValue / portfolio;
                if (ethRatio < buyEthRatio) {
                    const targetEthValue = keepEthRatioInPortfolio * portfolio;
                    const usdToSpend = targetEthValue - ethValue;
                    ethAmount += usdToSpend / ethPrice;
                    usdAmount -= usdToSpend;
                }
                if (ethRatio > sellEthRatio) {
                    const targetEthValue = keepEthRatioInPortfolio * portfolio;
                    const ethToSell = (ethValue - targetEthValue) / ethPrice;
                    ethAmount -= ethToSell;
                    usdAmount += ethToSell * ethPrice;
                }
            }
            const portfolio = round(
                btcAmount * btcKlines[endDay].openPrice + ethAmount * ethKlines[endDay].openPrice + usdAmount,
                3
            );

            const data = {
                initialDay,
                endDay,
                keepBtcRatioInPortfolio,
                buyBtcRatio,
                sellBtcRatio,
                keepEthRatioInPortfolio,
                buyEthRatio,
                sellEthRatio
            };
            const existedTest = await this.backtestRepository.findOne({
                where: { algorithm: AlgorithmType.MXR_1, data }
            });
            if (existedTest) {
                break;
            }
            await this.backtestRepository.insert({
                algorithm: AlgorithmType.MXR_1,
                investment,
                finalPortfolio: portfolio,
                performance: round(portfolio / investment, 4),
                data
            });
        }
    }
}
