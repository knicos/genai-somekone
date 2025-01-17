import { PropsWithChildren } from 'react';
import style from './style.module.css';
import { Spinner } from '@knicos/genai-base';

interface Props extends PropsWithChildren {
    loading: boolean;
    message?: string;
}

export default function Loading({ loading, children }: Props) {
    return loading ? (
        <div className={style.container}>
            <Spinner />
        </div>
    ) : (
        children
    );
}
