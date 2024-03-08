import { Side } from '@binance/connector-typescript';
import { ApiProperty } from '@nestjs/swagger';
import faker from 'faker';
import { Column, DeleteDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Exchanges } from '~core/enums/exchanges.enum';
import { TimestampTransformer } from '~core/transforms/timestamp.transformer';

@Entity('Order')
export class OrderEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ example: 'BTCUSDT' })
    @Column()
    symbol: string;

    @ApiProperty({ example: Side.BUY })
    @Column()
    side: Side;

    @ApiProperty({ example: faker.datatype.number() })
    @Column('numeric')
    price: number;

    @ApiProperty({ example: faker.datatype.number() })
    @Column('numeric')
    quantity: number;

    @ApiProperty({ example: Exchanges.BINANCE })
    @Column()
    exchange: Exchanges;

    @DeleteDateColumn({ type: 'timestamp', transformer: new TimestampTransformer() })
    deletedAt: number;
}
