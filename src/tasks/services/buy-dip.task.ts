import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LessThan, Not } from 'typeorm';
import { BuyDipRepository } from '~repositories/buy-dip.repository';

@Injectable()
export class BuyDipTask {
    constructor(private buyDipRepository: BuyDipRepository) {}

    @Cron(CronExpression.EVERY_10_SECONDS)
    async restoreBuyDip(): Promise<void> {
        const currentTime = Math.floor(Date.now() / 1000);
        const oneDayAgo = currentTime - 24 * 60 * 60;
        const deteledBuyDips = await this.buyDipRepository.find({
            where: { deletedAt: LessThan(oneDayAgo) },
            withDeleted: true
        });
        for (const buyDip of deteledBuyDips) {
            buyDip.deletedAt = null;
        }
        await this.buyDipRepository.save(deteledBuyDips);
    }
}
