import faker from 'faker';

export function randomPercentage(numerator: number, denominator: number): boolean {
    const randomNumber = faker.datatype.number({ min: 0, max: denominator - 1 });
    const trueNumbers = Array.from({ length: numerator }, (_, i) => i);
    return trueNumbers.includes(randomNumber);
}
