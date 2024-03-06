import { Global, Module } from '@nestjs/common';
import { WebsocketStream } from '@binance/connector-typescript';
import { BinanceSocketOrderGateway } from './gateway/binance-socket-order.gateway';

@Global()
@Module({
    imports: [],
    providers: [WebsocketStream, BinanceSocketOrderGateway],
    exports: []
})
export class BinanceSocketModule {}
