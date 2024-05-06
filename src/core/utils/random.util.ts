export function randomPercentage(numerator: number, denominator: number): boolean {
    const randomNumber = Math.floor(Math.random() * denominator);
    console.log('randomNumber', randomNumber);
    const trueNumbers = Array.from({ length: numerator }, (_, i) => i);
    console.log('trueNumbers', trueNumbers);
    return trueNumbers.includes(randomNumber);
}
