import { Module } from '@nestjs/common';
import { OrderController } from './controllers/order.controller';
import { OrderService } from './services/order.service';
import { TypeOrmHelperModule } from '~core/modules/typeorm-module.module';
import { OrderRepository } from './order.repository';
import { BinanceApiModule } from '~binance-api/binance-api.module';

@Module({
    imports: [TypeOrmHelperModule.forCustomRepository([OrderRepository]), BinanceApiModule],
    controllers: [OrderController],
    providers: [OrderService],
    exports: []
})
export class OrderModule {}
