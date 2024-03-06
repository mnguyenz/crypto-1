import { Repository } from 'typeorm';
import { CustomRepository } from '~core/decorators/custom-repository.decorator';
import { OrderEntity } from '~entities/order.entity';

@CustomRepository(OrderEntity)
export class OrderRepository extends Repository<OrderEntity> {}
