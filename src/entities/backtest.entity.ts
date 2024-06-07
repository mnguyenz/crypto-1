import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AlgorithmType } from '~algorithms/enums/algorithm-type.enum';

@Entity('Backtest')
export class BacktestEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    algorithm: AlgorithmType;
}
