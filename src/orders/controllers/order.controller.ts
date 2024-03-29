import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OrderEntity } from '~entities/order.entity';
import { Exchanges } from '~core/enums/exchanges.enum';
import { InsertResult } from 'typeorm';
import { CreateOrderDto } from '~orders/dtos/create-order.dto';
import { OrderService } from '~orders/services/order.service';
import { CompareOrderVsCurrentPriceResponse } from '~orders/responses/compare-order-vs-current-price.response';

@Controller('orders')
@ApiTags('Orders')
export class OrderController {
    constructor(private orderService: OrderService) {}

    @Get()
    getOrder(@Query('exchange') exchange?: Exchanges): Promise<OrderEntity[]> {
        return this.orderService.getOrder(exchange);
    }

    @Post()
    createBinanceOrder(@Body() createOrderDto: CreateOrderDto): Promise<InsertResult> {
        return this.orderService.createOrder(createOrderDto);
    }

    @Get('compare-price')
    compareOrderVsCurrentPrice(): Promise<CompareOrderVsCurrentPriceResponse[]> {
        return this.orderService.compareOrderVsCurrentPrice();
    }
}
