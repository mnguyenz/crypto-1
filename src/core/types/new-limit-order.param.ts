import { Side } from '@binance/connector-typescript';
import { RedeemUsdThenOrderParam } from './redeem-usd-then-order.param';

export type NewLimitOrderParam = RedeemUsdThenOrderParam & {
    side: Side;
};
