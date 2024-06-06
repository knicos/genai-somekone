export function calculateCount(high: number, low: number, value: number, max: number) {
    const range = high - low;
    if (range === 0) return 1;
    return Math.floor(((value - low) / range) * (max - 1) + 1);
}
