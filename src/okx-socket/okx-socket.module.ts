import { Global, Module } from '@nestjs/common';
import { TypeOrmHelperModule } from '~core/modules/typeorm-module.module';
import { OrderRepository } from '~repositories/order.repository';
import { OkxSocketOrderGateway } from './gateway/okx-socket-order.gateway';
import { OkxApiModule } from '~okx-api/okx-api.module';
import { OrderModule } from '~orders/order.module';

@Global()
@Module({
    imports: [TypeOrmHelperModule.forCustomRepository([OrderRepository]), OkxApiModule, OrderModule],
    providers: [OkxSocketOrderGateway],
    exports: []
})
export class OkxSocketModule {}
