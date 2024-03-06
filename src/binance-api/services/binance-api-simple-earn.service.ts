import { Injectable } from '@nestjs/common';
import { RedeemDestAccount } from '@binance/connector-typescript';
import { BINANCE_CLIENT } from '~core/constants/binance.constant';
import { BINANCE_SIMPLE_EARN_PRODUCT_ID } from '~binance-api/constants/binance-simple-earn.constant';

@Injectable()
export class BinanceApiSimpleEarnService {
    constructor() {}

    async redeemUSDT(amount: number): Promise<void> {
        try {
            await BINANCE_CLIENT.redeemFlexibleProduct(BINANCE_SIMPLE_EARN_PRODUCT_ID.USDT, {
                amount,
                destAccount: RedeemDestAccount.SPOT
            });
        } catch (error) {
            console.error('redeemUSDT error:', error);
        }
    }
}
