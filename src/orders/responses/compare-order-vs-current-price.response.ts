export type CompareOrderVsCurrentPriceResponse = {
    symbol: string;
    currentPrice: number;
    orderPrice: number;
    totalAmount: number;
    percentage: number;
};
