import { Repository } from 'typeorm';
import { CustomRepository } from '~core/decorators/custom-repository.decorator';
import { KlineEntity } from '~entities/kline.entity';

@CustomRepository(KlineEntity)
export class KlineRepository extends Repository<KlineEntity> {}
