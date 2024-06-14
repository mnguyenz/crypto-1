import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AlgorithmType } from '~algorithms/enums/algorithm-type.enum';

@Entity('Backtest')
export class BacktestEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('enum', {
        enum: AlgorithmType
    })
    algorithm: AlgorithmType;

    @Column('jsonb', { nullable: true })
    data: Record<string, unknown>;

    @Column('numeric')
    investment: number;

    @Column('numeric')
    finalPortfolio: number;

    @Column('numeric')
    performance: number;
}
