import { Module } from '@nestjs/common';
import { BuyDipRepository } from '~repositories/buy-dip.repository';
import { TypeOrmHelperModule } from '~core/modules/typeorm-module.module';
import { BuyDipService } from './services/buy-dip.service';
import { BinanceApiModule } from '~binance-api/binance-api.module';
import { OkxApiModule } from '~okx-api/okx-api.module';

@Module({
    imports: [TypeOrmHelperModule.forCustomRepository([BuyDipRepository]), BinanceApiModule, OkxApiModule],
    controllers: [],
    providers: [BuyDipService],
    exports: [BuyDipService]
})
export class AlgorithmModule {}
