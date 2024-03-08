export function roundDown(number: number, decimalPlaces: number): number {
    const factor = 10 ** decimalPlaces;
    return Math.floor(number * factor) / factor;
}

export function round(number: number, decimalPlaces: number): number {
    const factor = 10 ** decimalPlaces;
    return Math.round(number * factor) / factor;
}

export function roundUp(number: number, decimalPlaces: number): number {
    const factor = 10 ** decimalPlaces;
    return Math.ceil(number * factor) / factor;
}
