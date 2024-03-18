import { Exchanges } from '~core/enums/exchanges.enum';

export type CheckOrderPriceParam = {
    exchange: Exchanges;
    symbol: string;
    currentPrice: number;
};
