import { RestClient } from 'okx-api';
import { env } from '~config/env.config';

export const OKX_REST_PRIVATE_CLIENT = new RestClient({
    apiKey: env.OKX.X_API_KEY,
    apiSecret: env.OKX.X_API_SECRET,
    apiPass: env.OKX.X_API_PASS
});

export const OKX_POSTFIX_SYMBOL_USDT = '-USDT';
