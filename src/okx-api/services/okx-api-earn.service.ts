import { Injectable } from '@nestjs/common';
import { ASSETS } from '~core/constants/crypto-code.constant';
import { OKX_MIN_SAVING_BTC_ETH, OKX_REST_PRIVATE_CLIENT } from '~core/constants/okx.constant';

@Injectable()
export class OkxApiEarnService {
    constructor() {}

    async redeem(asset: string, amount: number): Promise<void> {
        try {
            await OKX_REST_PRIVATE_CLIENT.savingsPurchaseRedemption(asset, amount.toString(), 'redempt', '0.01');
            await OKX_REST_PRIVATE_CLIENT.fundsTransfer({
                ccy: asset,
                amt: amount.toString(),
                from: '6',
                to: '18',
                type: '0'
            });
        } catch (error) {
            console.error('OKX redeem error:', error);
        }
    }

    async purchaseMaxToSaving(asset: string): Promise<void> {
        try {
            const balance = await OKX_REST_PRIVATE_CLIENT.getBalance(asset);
            const amount = balance[0].details[0]?.availBal;
            if (
                (asset === ASSETS.CRYPTO.BTC || asset === ASSETS.CRYPTO.ETH) &&
                parseFloat(amount) >= OKX_MIN_SAVING_BTC_ETH
            ) {
                await OKX_REST_PRIVATE_CLIENT.fundsTransfer({
                    ccy: asset,
                    amt: amount,
                    from: '18',
                    to: '6',
                    type: '0'
                });
                await OKX_REST_PRIVATE_CLIENT.savingsPurchaseRedemption(asset, amount, 'purchase', '0.01');
            }
        } catch (error) {
            console.error('OKX purchaseMaxToSaving error:', error);
        }
    }
}
