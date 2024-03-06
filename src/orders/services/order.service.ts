import { Injectable } from '@nestjs/common';
import { InsertResult } from 'typeorm';
import { Exchanges } from '~core/enums/exchanges.enum';
import { OrderEntity } from '~entities/order.entity';
import { CreateOrderDto } from '~orders/dtos/create-order.dto';
import { OrderRepository } from '~orders/order.repository';

@Injectable()
export class OrderService {
    constructor(private orderRepository: OrderRepository) {}

    getOrder(exchange: Exchanges): Promise<OrderEntity[]> {
        return this.orderRepository.find({ where: { exchange } });
    }

    createOrder(createOrderDto: CreateOrderDto): Promise<InsertResult> {
        return this.orderRepository.insert(createOrderDto);
    }
}
