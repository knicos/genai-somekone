import webWorker from './worker';

const rpcMap = new Map<number, (r: unknown) => void>();
let count = 0;

interface MessageType {
    name: string;
    id: number;
    args?: unknown;
    result?: unknown;
}

webWorker.onmessage = (e: MessageEvent<MessageType>) => {
    const r = rpcMap.get(e.data.id);
    if (r) {
        rpcMap.delete(e.data.id);
        if (e.data.result !== undefined) {
            r(e.data.result);
        }
    } else {
        console.error('No promise resolve', e.data);
    }
};

export function rpcCall<T>(name: string, args: unknown[]): Promise<T> {
    const id = count++;
    return new Promise<T>((resolve) => {
        rpcMap.set(id, resolve as (r: unknown) => void);
        webWorker.postMessage({ name, args, id });
    });
}
