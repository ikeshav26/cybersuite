/**
 * Number Utilities
 */

/**
 * Clamp number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

/**
 * Generate random number between min and max
 */
export function random(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

/**
 * Generate random integer between min and max (inclusive)
 */
export function randomInt(min: number, max: number): number {
    return Math.floor(random(min, max + 1));
}

/**
 * Round number to specific decimal places
 */
export function round(value: number, decimals: number = 0): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
}

/**
 * Check if number is between min and max (inclusive)
 */
export function inRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
}

/**
 * Linear interpolation between two values
 */
export function lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
}

/**
 * Map value from one range to another
 */
export function mapRange(
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number
): number {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

/**
 * Calculate percentage
 */
export function percentage(value: number, total: number): number {
    if (total === 0) return 0;
    return (value / total) * 100;
}

/**
 * Calculate average of numbers
 */
export function average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return sum(numbers) / numbers.length;
}

/**
 * Calculate sum of numbers
 */
export function sum(numbers: number[]): number {
    return numbers.reduce((acc, num) => acc + num, 0);
}

/**
 * Find median of numbers
 */
export function median(numbers: number[]): number {
    if (numbers.length === 0) return 0;

    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
        return (sorted[mid - 1]! + sorted[mid]!) / 2;
    }

    return sorted[mid]!;
}

/**
 * Find mode (most frequent value) in numbers
 */
export function mode(numbers: number[]): number | undefined {
    if (numbers.length === 0) return undefined;

    const frequency = new Map<number, number>();
    let maxFreq = 0;
    let modeValue: number | undefined;

    numbers.forEach(num => {
        const freq = (frequency.get(num) || 0) + 1;
        frequency.set(num, freq);

        if (freq > maxFreq) {
            maxFreq = freq;
            modeValue = num;
        }
    });

    return modeValue;
}

/**
 * Calculate standard deviation
 */
export function standardDeviation(numbers: number[]): number {
    if (numbers.length === 0) return 0;

    const avg = average(numbers);
    const squareDiffs = numbers.map(num => Math.pow(num - avg, 2));
    const avgSquareDiff = average(squareDiffs);

    return Math.sqrt(avgSquareDiff);
}

/**
 * Check if number is even
 */
export function isEven(num: number): boolean {
    return num % 2 === 0;
}

/**
 * Check if number is odd
 */
export function isOdd(num: number): boolean {
    return num % 2 !== 0;
}

/**
 * Convert degrees to radians
 */
export function degreesToRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
}

/**
 * Convert radians to degrees
 */
export function radiansToDegrees(radians: number): number {
    return (radians * 180) / Math.PI;
}
