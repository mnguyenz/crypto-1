import { RedeemUsdThenOrderParam } from './redeem-usd-then-order.param';

export type RedeemCryptoThenOrderParam = RedeemUsdThenOrderParam & {
    asset: string;
};
