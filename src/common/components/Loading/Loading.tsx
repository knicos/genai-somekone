import { PropsWithChildren } from 'react';
import style from './style.module.css';
import { AlertPara, Spinner } from '@genai-fi/base';

interface Props extends PropsWithChildren {
    loading: boolean;
    message?: string;
}

export default function Loading({ loading, children, message }: Props) {
    return loading ? (
        <div className={style.container}>
            <Spinner />
            {message && (
                <div className={style.message}>
                    <AlertPara severity="info">{message}</AlertPara>
                </div>
            )}
        </div>
    ) : (
        children
    );
}
