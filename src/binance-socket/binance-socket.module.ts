import { Global, Module } from '@nestjs/common';
import { WebsocketStream } from '@binance/connector-typescript';
import { BinanceSocketOrderGateway } from './gateway/binance-socket-order.gateway';
import { TypeOrmHelperModule } from '~core/modules/typeorm-module.module';
import { OrderRepository } from '~orders/order.repository';
import { BinanceApiModule } from '~binance-api/binance-api.module';

@Global()
@Module({
    imports: [TypeOrmHelperModule.forCustomRepository([OrderRepository]), BinanceApiModule],
    providers: [WebsocketStream, BinanceSocketOrderGateway],
    exports: []
})
export class BinanceSocketModule {}
