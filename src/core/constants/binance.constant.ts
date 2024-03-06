import { Spot } from '@binance/connector-typescript';
import { env } from '~config/env.config';

export const BINANCE_CLIENT = new Spot(env.BINANCE.API_KEY, env.BINANCE.API_SECRET, { baseURL: env.BINANCE.API_URL });
