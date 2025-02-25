import { useEffect } from 'react';
import { RecoilValue, useRecoilValue } from 'recoil';

interface Props {
    node: RecoilValue<unknown>;
    onChange: (value: unknown) => void;
}

export const RecoilObserver = ({ node, onChange }: Props) => {
    const value = useRecoilValue(node);
    useEffect(() => onChange(value), [onChange, value]);
    return null;
};
