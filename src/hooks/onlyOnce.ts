import { useMemo } from 'react';

export function useOnlyOnce(key: string, value: boolean) {
    return useMemo(() => {
        const cur = window.sessionStorage.getItem(key);
        if (cur) return true;
        if (value) window.sessionStorage.setItem(key, 'true');
        return value;
    }, [key, value]);
}
