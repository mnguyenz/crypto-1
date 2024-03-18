import { OrderEntity } from '~entities/order.entity';

export type CacheOrder = OrderEntity & { symbol: string };
