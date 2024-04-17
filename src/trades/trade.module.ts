import { Module } from '@nestjs/common';
import { TradeService } from './services/trade.service';
import { TradeController } from './controllers/trade.controller';
import { TypeOrmHelperModule } from '~core/modules/typeorm-module.module';
import { TradeRepository } from '~repositories/trade.repository';

@Module({
    imports: [TypeOrmHelperModule.forCustomRepository([TradeRepository])],
    controllers: [TradeController],
    providers: [TradeService],
    exports: [TradeService]
})
export class TradeModule {}
