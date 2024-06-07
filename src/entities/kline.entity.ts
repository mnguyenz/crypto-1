import { Column, Entity, Index, PrimaryColumn } from 'typeorm';
import { Interval } from '@binance/connector-typescript';
import { ColumnNumericTransformer } from '~core/transforms/numeric.transformer';

@Entity('Kline')
@Index(['symbol', 'interval', 'closeTime'], { unique: true })
export class KlineEntity {
    @PrimaryColumn()
    symbol: string;

    @PrimaryColumn({ type: 'enum', enum: Interval })
    interval: Interval;

    @Column({ type: 'bigint' })
    openTime: bigint;

    @Column('numeric', {
        scale: 12,
        precision: 24,
        transformer: new ColumnNumericTransformer()
    })
    openPrice: number;

    @Column('numeric', {
        scale: 12,
        precision: 24,
        transformer: new ColumnNumericTransformer()
    })
    highPrice: number;

    @Column('numeric', {
        scale: 12,
        precision: 24,
        transformer: new ColumnNumericTransformer()
    })
    lowPrice: number;

    @Column('numeric', {
        scale: 12,
        precision: 24,
        transformer: new ColumnNumericTransformer()
    })
    closePrice: number;

    @Column('numeric')
    volume: number;

    @PrimaryColumn({ type: 'bigint' })
    closeTime: bigint;

    @Column('numeric', {
        scale: 12,
        precision: 24,
        transformer: new ColumnNumericTransformer()
    })
    quoteAssetVolume: number;

    @Column()
    numberOfTrades: number;

    @Column('numeric', {
        scale: 12,
        precision: 24,
        transformer: new ColumnNumericTransformer()
    })
    takerBuyBaseAssetVolume: number;

    @Column('numeric', {
        scale: 12,
        precision: 24,
        transformer: new ColumnNumericTransformer()
    })
    takerBuyQuoteAssetVolume: number;
}
