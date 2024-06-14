import { Module } from '@nestjs/common';
import { BacktestController } from './controllers/backtest.controller';
import { BacktestService } from './services/backtest.service';
import { TypeOrmHelperModule } from '~core/modules/typeorm-module.module';
import { KlineRepository } from '~repositories/kline.repository';
import { BacktestRepository } from '~repositories/backtest.repository';

@Module({
    imports: [TypeOrmHelperModule.forCustomRepository([BacktestRepository, KlineRepository])],
    controllers: [BacktestController],
    providers: [BacktestService],
    exports: []
})
export class BacktestModule {}
