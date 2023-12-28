export function uniqueSubset<T, V extends string | number>(nodes: T[], valueFn: (n: T) => V) {
    const seen = new Set<V>();
    const results: T[] = [];

    nodes.forEach((node) => {
        const v = valueFn(node);
        if (!seen.has(v)) {
            seen.add(v);
            results.push(node);
        }
    });

    return results;
}

export function uniformUniqueSubset<T, V extends string | number>(
    nodes: T[],
    count: number,
    valueFn: (n: T) => V
): T[] {
    const unique = uniqueSubset(nodes, valueFn);
    if (unique.length <= count) return unique;
    const seen = new Set<V>();
    const results: T[] = [];

    // It might be faster to remove candidates than to retry.
    while (results.length < count) {
        const ix = Math.floor(Math.random() * unique.length);
        const v = valueFn(unique[ix]);
        if (!seen.has(v)) {
            seen.add(v);
            results.push(unique[ix]);
        }
    }

    return results;
}

export function biasedUniqueSubset<T, V extends string | number>(nodes: T[], count: number, valueFn: (n: T) => V): T[] {
    const unique = uniqueSubset(nodes, valueFn);
    if (unique.length <= count) return unique;
    const seen = new Set<V>();
    const results: T[] = [];

    while (results.length < count) {
        const uniform = Math.random();
        const beta = Math.sin((uniform * Math.PI) / 2);
        const beta2 = beta * beta;
        const beta_left = beta2 < 0.5 ? 2 * beta2 : 2 * (1 - beta2);
        const ix = Math.floor(beta_left * unique.length);

        const v = valueFn(unique[ix]);
        if (!seen.has(v)) {
            seen.add(v);
            results.push(unique[ix]);
        }
    }

    return results;
}
