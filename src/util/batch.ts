export function batchMap<T, U>(input: T[], chunk: number, fn: (v: T) => U): Promise<U[]> {
    return new Promise((resolve) => {
        let index = 0;
        const output = new Array<U>(input.length);

        const chunkFn = () => {
            let count = chunk;
            while (count-- && index < input.length) {
                try {
                    output[index] = fn(input[index]);
                } catch (e) {
                    console.error('Batch error', e);
                }
                index += 1;
            }
            if (index < input.length) {
                setTimeout(chunkFn, 0);
            } else {
                resolve(output);
            }
        };
        setTimeout(chunkFn, 0);
    });
}
