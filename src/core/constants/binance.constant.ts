import { Spot } from '@binance/connector-typescript';
import { env } from '~config/env.config';

export const BINANCE_CLIENT = new Spot(env.BINANCE.X_API_KEY, env.BINANCE.X_API_SECRET, {
    baseURL: env.BINANCE.API_URL
});
export const M_BINANCE_CLIENT = new Spot(env.BINANCE.M_API_KEY, env.BINANCE.M_API_SECRET, {
    baseURL: env.BINANCE.API_URL
});

export const BINANCE_POSTFIX_SYMBOL_USDT = 'USDT';
export const BINANCE_POSTFIX_SYMBOL_FDUSD = 'FDUSD';
export const BINANCE_EARN_BNB_ID = 'BNB001';
