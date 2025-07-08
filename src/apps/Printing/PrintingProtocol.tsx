import { PropsWithChildren, useEffect, useState } from 'react';
import { useSetAtom } from 'jotai';
import { storedPrintData } from './state/printState';

interface Props extends PropsWithChildren {
    code: string;
}

export function PrintingProtocol({ children, code }: Props) {
    const [hasData, setHasData] = useState(false);
    const setPrintData = useSetAtom(storedPrintData);

    useEffect(() => {
        if (!window.BroadcastChannel) return;

        const bc = new window.BroadcastChannel('printing');
        bc.onmessage = (ev: MessageEvent) => {
            setPrintData(ev.data);
            setHasData(true);
            bc.close();
        };
        bc.postMessage(`request_${code}`);
        return () => {
            bc.close();
        };
    }, [code, setPrintData]);

    return hasData ? children : null;
}
