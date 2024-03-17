import { Module } from '@nestjs/common';
import { OrderController } from './controllers/order.controller';
import { OrderService } from './services/order.service';
import { TypeOrmHelperModule } from '~core/modules/typeorm-module.module';
import { OrderRepository } from '../repositories/order.repository';
import { BinanceApiModule } from '~binance-api/binance-api.module';
import { OkxApiModule } from '~okx-api/okx-api.module';
import { OrderSocketService } from './services/order-socket.service';

@Module({
    imports: [TypeOrmHelperModule.forCustomRepository([OrderRepository]), BinanceApiModule, OkxApiModule],
    controllers: [OrderController],
    providers: [OrderService, OrderSocketService],
    exports: [OrderSocketService]
})
export class OrderModule {}
