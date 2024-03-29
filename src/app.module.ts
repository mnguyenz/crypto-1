import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BinanceSocketModule } from '~binance-socket/binance-socket.module';
import { databaseConfig } from '~config/database.config';
import { scheduleConfig } from '~config/schedule.config';
import { GlobalCacheModule } from '~config/cache.config';
import { OrderModule } from '~orders/order.module';
import { OkxSocketModule } from '~okx-socket/okx-socket.module';
import { TaskModule } from '~tasks/task.module';
import { SeedModule } from '~seeds/seed.module';
import { AlgorithmModule } from '~algorithms/algorithm.module';

@Module({
    imports: [
        databaseConfig,
        scheduleConfig,
        GlobalCacheModule,
        AlgorithmModule,
        BinanceSocketModule,
        OkxSocketModule,
        OrderModule,
        SeedModule,
        TaskModule
    ],
    controllers: [AppController],
    providers: [AppService]
})
export class AppModule {}
