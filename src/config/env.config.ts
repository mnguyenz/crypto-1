import dotenv from 'dotenv';
dotenv.config();

export const env = {
    APP_PORT: process.env.APP_PORT || 4001,
    DATABASE: {
        CONNECT: process.env.DATABASE_CONNECT as any,
        HOST: process.env.DATABASE_HOST,
        PORT: Number(process.env.DATABASE_PORT),
        USER: process.env.DATABASE_USER,
        PASSWORD: process.env.DATABASE_PASSWORD,
        NAME: process.env.DATABASE_NAME
    },
    BINANCE: {
        API_URL: process.env.BINANCE_API_URL,
        M_API_KEY: process.env.M_BINANCE_API_KEY,
        M_API_SECRET: process.env.M_BINANCE_API_SECRET,
        X_API_KEY: process.env.X_BINANCE_API_KEY,
        X_API_SECRET: process.env.X_BINANCE_API_SECRET
    },
    OKX: {
        X_API_KEY: process.env.X_OKX_API_KEY,
        X_API_SECRET: process.env.X_OKX_API_SECRET,
        X_API_PASS: process.env.X_OKX_API_PASS
    }
};
