import { Repository } from 'typeorm';
import { CustomRepository } from '~core/decorators/custom-repository.decorator';
import { TradeEntity } from '~entities/trade.entity';

@CustomRepository(TradeEntity)
export class TradeRepository extends Repository<TradeEntity> {}
