import { Side } from '@binance/connector-typescript';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Exchanges } from '~core/enums/exchanges.enum';

@Entity('Order')
export class OrderEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    symbol: string;

    @Column()
    side: Side;

    @Column('numeric')
    price: number;

    @Column('numeric')
    quantity: number;

    @Column()
    exchange: Exchanges;
}
