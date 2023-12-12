export function normalise(vec: number[]): number[] {
    const sum = vec.reduce((s, v) => s + v, 0);
    if (sum === 0) return vec;
    return vec.map((v) => v / sum);
}
