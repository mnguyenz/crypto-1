import { RestClient } from 'okx-api';
import { env } from '~config/env.config';

export const OKX_REST_PRIVATE_CLIENT = new RestClient({
    apiKey: env.OKX.API_KEY,
    apiSecret: env.OKX.API_SECRET,
    apiPass: env.OKX.API_PASS
});
