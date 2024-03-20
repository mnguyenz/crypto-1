import { Side } from '@binance/connector-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import faker from 'faker';
import { Column, DeleteDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ASSETS } from '~core/constants/crypto-code.constant';
import { Exchanges } from '~core/enums/exchanges.enum';
import { OrderStrategy } from '~core/enums/order-strategy.enum';
import { TimestampTransformer } from '~core/transforms/timestamp.transformer';

@Entity('Order')
export class OrderEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ example: ASSETS.CRYPTO.BTC })
    @Column()
    asset: string;

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

    @ApiProperty({ example: OrderStrategy.MANUAL, default: OrderStrategy.MANUAL, nullable: true })
    @IsOptional()
    @Column({ type: 'varchar', enum: OrderStrategy, nullable: true })
    strategy: OrderStrategy;

    @DeleteDateColumn({ type: 'timestamp', transformer: new TimestampTransformer() })
    deletedAt: number;
}
