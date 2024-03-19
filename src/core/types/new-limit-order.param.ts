import { Side } from '@binance/connector-typescript';
import { RedeemThenOrderParam } from './redeem-then-order.param';

export type NewLimitOrderParam = Omit<RedeemThenOrderParam, 'asset'> & {
    side: Side;
};
