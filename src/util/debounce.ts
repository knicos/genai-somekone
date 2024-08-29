// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce_leading<T extends (...args: any[]) => void>(
    f: T,
    rate: number
): [(...args: Parameters<T>) => void, () => void] {
    let lastCall = -1;
    let timeout = -1;
    let lastArgs: Parameters<T>;

    return [
        (...args: Parameters<T>) => {
            lastArgs = args;

            if (timeout >= 0) {
                return;
            }

            const now = Date.now();
            const diff = now - lastCall;

            if (diff < rate) {
                timeout = window.setTimeout(() => {
                    timeout = -1;
                    lastCall = Date.now();
                    f(...lastArgs);
                }, rate - diff);
            } else {
                lastCall = now;
                f(...lastArgs);
            }
        },
        () => {
            if (timeout >= 0) clearTimeout(timeout);
        },
    ];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => void>(
    f: T,
    rate: number
): [(...args: Parameters<T>) => void, () => void] {
    let timeout = -1;
    let lastArgs: Parameters<T>;

    return [
        (...args: Parameters<T>) => {
            lastArgs = args;

            if (timeout >= 0) {
                return;
            }

            timeout = window.setTimeout(() => {
                timeout = -1;
                f(...lastArgs);
            }, rate);
        },
        () => {
            if (timeout >= 0) clearTimeout(timeout);
        },
    ];
}
