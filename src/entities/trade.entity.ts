import { Side } from '@binance/connector-typescript';
import { ApiProperty } from '@nestjs/swagger';
import faker from 'faker';
import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { ASSETS, OKX_SYMBOLS } from '~core/constants/crypto-code.constant';
import { Exchanges } from '~core/enums/exchanges.enum';

@Entity('Trade')
@Unique(['orderIdReference', 'exchange'])
export class TradeEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ example: faker.datatype.string() })
    @Column()
    orderIdReference: string;

    @Column({ type: 'bigint' })
    tradeTime: bigint;

    @ApiProperty({ example: ASSETS.CRYPTO.BTC })
    @Column()
    asset: string;

    @ApiProperty({ example: OKX_SYMBOLS.BTCUSDT })
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

    @ApiProperty({ example: faker.datatype.number() })
    @Column('numeric')
    fee: number;

    @ApiProperty({ example: ASSETS.FIAT.USDT })
    @Column()
    feeAsset: string;

    @ApiProperty({ example: Exchanges.BINANCE })
    @Column()
    exchange: Exchanges;
}
