import { ASSETS } from '~core/constants/crypto-code.constant';
import { AssetsFromSymbol } from '~core/types/assets-from-symbol.type';

export function getAssetsFromSymbol(symbol: string): AssetsFromSymbol {
    const quoteAssets = [
        ...Object.values(ASSETS.FIAT),
        ...Object.values(ASSETS.FIAT_NOT_USD),
        ...Object.values(ASSETS.CRYPTO)
    ];
    for (const asset of quoteAssets) {
        if (symbol.endsWith(asset)) {
            return {
                baseAsset: symbol.slice(0, -asset.length),
                quoteAsset: symbol.slice(-asset.length)
            };
        }
    }
};
