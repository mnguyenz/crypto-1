import { Module } from '@nestjs/common';
import { NewListingTask } from './services/new-listing.task';
import { BinanceApiModule } from '~binance-api/binance-api.module';

@Module({
    imports: [BinanceApiModule],
    controllers: [],
    providers: [NewListingTask],
    exports: []
})
export class TaskModule {}
