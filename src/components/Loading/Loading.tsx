import { PropsWithChildren } from 'react';
import style from './style.module.css';
import Spinner from '@genaism/components/Spinner/Spinner';

interface Props extends PropsWithChildren {
    loading: boolean;
    message?: string;
}

export default function Loading({ loading, children, message }: Props) {
    return loading ? (
        <div className={style.container}>
            <Spinner size="large" />
            <h1>{message || '...'}</h1>
        </div>
    ) : (
        children
    );
}
