import { Interval } from '@binance/connector-typescript';
import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { KlineRepository } from '~repositories/kline.repository';

@Injectable()
export class BacktestService {
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private klineRepository: KlineRepository
    ) {}

    async backTestMxr1(): Promise<void> {
    }
}
