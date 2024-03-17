import { Global, Module } from '@nestjs/common';
import { WebsocketStream } from '@binance/connector-typescript';
import { BinanceSocketOrderGateway } from './gateway/binance-socket-order.gateway';
import { TypeOrmHelperModule } from '~core/modules/typeorm-module.module';
import { OrderRepository } from '~repositories/order.repository';
import { BinanceApiModule } from '~binance-api/binance-api.module';
import { OrderModule } from '~orders/order.module';
import { AlgorithmModule } from '~algorithms/algorithm.module';

@Global()
@Module({
    imports: [
        TypeOrmHelperModule.forCustomRepository([OrderRepository]),
        AlgorithmModule,
        BinanceApiModule,
        OrderModule
    ],
    providers: [WebsocketStream, BinanceSocketOrderGateway],
    exports: []
})
export class BinanceSocketModule {}
