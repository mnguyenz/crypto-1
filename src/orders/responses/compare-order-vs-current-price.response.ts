export type CompareOrderVsCurrentPriceResponse = {
    symbol: string;
    currentPrice: number;
    orderPrice: number;
    percentageReduction: number;
};
