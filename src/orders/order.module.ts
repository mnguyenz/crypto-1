import { Module } from '@nestjs/common';
import { OrderController } from './controllers/order.controller';
import { OrderService } from './services/order.service';
import { TypeOrmHelperModule } from '~core/modules/typeorm-module.module';
import { OrderRepository } from './order.repository';

@Module({
    imports: [TypeOrmHelperModule.forCustomRepository([OrderRepository])],
    controllers: [OrderController],
    providers: [OrderService],
    exports: []
})
export class OrderModule {}
