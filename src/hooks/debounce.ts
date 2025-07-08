import { debounce } from '@genaism/util/debounce';
import { Dispatch, SetStateAction, useRef, useState } from 'react';

export function useDebouncedState<T>(initial: T, rate: number): [T, Dispatch<SetStateAction<T>>] {
    const [v, setV] = useState<T>(initial);
    const debRef = useRef<[typeof setV, () => void]>(undefined);
    if (!debRef.current) {
        debRef.current = debounce(setV, rate, true);
    }
    return [v, debRef.current[0]];
}
