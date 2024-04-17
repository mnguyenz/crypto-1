import { Module } from '@nestjs/common';
import { AverageCalculationController } from './controllers/average-calculation.controller';
import { AverageCalculationService } from './services/average-calculation.service';
import { TradeRepository } from '~repositories/trade.repository';
import { TypeOrmHelperModule } from '~core/modules/typeorm-module.module';

@Module({
    imports: [TypeOrmHelperModule.forCustomRepository([TradeRepository])],
    controllers: [AverageCalculationController],
    providers: [AverageCalculationService],
    exports: [AverageCalculationService]
})
export class AverageCalculationModule {}
