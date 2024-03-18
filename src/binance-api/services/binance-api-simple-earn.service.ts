import { Injectable } from '@nestjs/common';
import { RedeemDestAccount } from '@binance/connector-typescript';
import { BINANCE_CLIENT } from '~core/constants/binance.constant';

@Injectable()
export class BinanceApiSimpleEarnService {
    constructor() {}

    async redeem(asset: string, amount: number): Promise<void> {
        try {
            console.log('asset:', asset, 'amount:', amount);
            const simpleEarnProduct = await BINANCE_CLIENT.getSimpleEarnFlexibleProductList({ asset });
            console.log('simpleEarnProduct:', simpleEarnProduct);
            const productId = simpleEarnProduct.rows[0].productId;
            console.log('productId:', productId);
            await BINANCE_CLIENT.redeemFlexibleProduct(productId, {
                amount,
                destAccount: RedeemDestAccount.SPOT
            });
        } catch (error) {
            console.error('redeemUSDT Binance error:', error);
        }
    }
}
