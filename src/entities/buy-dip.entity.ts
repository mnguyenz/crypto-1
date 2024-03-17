import { ApiProperty } from '@nestjs/swagger';
import faker from 'faker';
import { Column, DeleteDateColumn, Entity, PrimaryColumn } from 'typeorm';
import { BINANCE_SYMBOLS } from '~core/constants/crypto-code.constant';
import { Exchanges } from '~core/enums/exchanges.enum';
import { TimestampTransformer } from '~core/transforms/timestamp.transformer';

@Entity('BuyDip')
export class BuyDipEntity {
    @ApiProperty({ example: BINANCE_SYMBOLS.BTCUSDT })
    @PrimaryColumn()
    symbol: string;

    @ApiProperty({ example: faker.datatype.number() })
    @PrimaryColumn('numeric')
    percentageDecrease: number;

    @ApiProperty({ example: Exchanges.BINANCE, default: Exchanges.BINANCE })
    @Column()
    exchange: Exchanges;

    @DeleteDateColumn({ type: 'timestamp', transformer: new TimestampTransformer() })
    deletedAt: number;
}
