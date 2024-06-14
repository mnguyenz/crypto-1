import { Repository } from 'typeorm';
import { CustomRepository } from '~core/decorators/custom-repository.decorator';
import { BacktestEntity } from '~entities/backtest.entity';

@CustomRepository(BacktestEntity)
export class BacktestRepository extends Repository<BacktestEntity> {}
