import { Injectable } from '@nestjs/common';
import { RedeemDestAccount } from '@binance/connector-typescript';
import { BINANCE_CLIENT } from '~core/constants/binance.constant';

@Injectable()
export class BinanceApiSimpleEarnService {
    constructor() {}

    async redeem(asset: string, amount: number): Promise<void> {
        try {
            const simpleEarnProduct = await BINANCE_CLIENT.getSimpleEarnFlexibleProductList({ asset });
            const productId = simpleEarnProduct.rows[0].productId;
            await BINANCE_CLIENT.redeemFlexibleProduct(productId, {
                amount,
                destAccount: RedeemDestAccount.SPOT
            });
        } catch (error) {
            console.error('redeemUSDT Binance error:', error);
        }
    }
}
