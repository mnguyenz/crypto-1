import { Injectable } from '@nestjs/common';
import { OKX_REST_PRIVATE_CLIENT } from '~core/constants/okx.constant';

@Injectable()
export class OkxApiEarnService {
    constructor() {}

    async redeemUSDT(amount: number): Promise<void> {
        try {
            await OKX_REST_PRIVATE_CLIENT.savingsPurchaseRedemption('USDT', amount.toString(), 'redempt', '0.01');
            await OKX_REST_PRIVATE_CLIENT.fundsTransfer({
                ccy: 'USDT',
                amt: amount.toString(),
                from: '6',
                to: '18',
                type: '0'
            });
        } catch (error) {
            console.error('redeemUSDT error:', error);
        }
    }
}
