import { Repository } from 'typeorm';
import { CustomRepository } from '~core/decorators/custom-repository.decorator';
import { BuyDipEntity } from '~entities/buy-dip.entity';

@CustomRepository(BuyDipEntity)
export class BuyDipRepository extends Repository<BuyDipEntity> {}
