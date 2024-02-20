import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const TAB_ID = uuidv4();

export function TabBlocker() {
    useEffect(() => {
        const bc = new BroadcastChannel('genai-tab-check');
        bc.onmessage = (e: MessageEvent<string>) => {
            if (e.data === 'check_tab') {
                bc.postMessage(TAB_ID);
            }
        };
        return () => {
            bc.close();
        };
    }, []);

    return null;
}

export function useDuplicateTabCheck() {
    const [found, setFound] = useState(false);

    useEffect(() => {
        const bc = new BroadcastChannel('genai-tab-check');
        bc.onmessage = (e: MessageEvent<string>) => {
            if (e.data !== TAB_ID) {
                setFound(true);
            }
        };
        bc.postMessage('check_tab');
        return () => {
            bc.close();
        };
    }, []);

    return found;
}
