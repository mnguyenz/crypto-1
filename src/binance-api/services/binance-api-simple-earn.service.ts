import { Injectable } from '@nestjs/common';
import { RedeemDestAccount } from '@binance/connector-typescript';
import { BINANCE_CLIENT } from '~core/constants/binance.constant';

@Injectable()
export class BinanceApiSimpleEarnService {
    constructor() {}

    async redeem(asset: string, amount: number): Promise<any> {
        try {
            const simpleEarnProduct = await BINANCE_CLIENT.getSimpleEarnFlexibleProductList({ asset });
            const productId = simpleEarnProduct.rows[0].productId;
            return BINANCE_CLIENT.redeemFlexibleProduct(productId, {
                amount,
                destAccount: RedeemDestAccount.SPOT
            });
        } catch (error) {
            console.error('redeem Binance error:', error);
            return error;
        }
    }
}
