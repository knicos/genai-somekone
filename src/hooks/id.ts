import randomId from '@genaism/util/randomId';
import { useMemo } from 'react';

export function useID(size?: number) {
    return useMemo(() => {
        const saved = window.sessionStorage.getItem(`genai-sm-idcode-${size}`);
        if (saved) {
            return saved;
        } else {
            const newcode = randomId(size);
            window.sessionStorage.setItem(`genai-sm-idcode-${size}`, newcode);
            return newcode;
        }
    }, [size]);
}
