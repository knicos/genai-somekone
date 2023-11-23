import { PropsWithChildren } from 'react';
import style from './style.module.css';
import { useTranslation } from 'react-i18next';
import Spinner from '@genaism/components/Spinner/Spinner';

interface Props extends PropsWithChildren {
    loading: boolean;
    message?: string;
}

export default function Loading({ loading, children, message }: Props) {
    const { t } = useTranslation();

    return loading ? (
        <div className={style.container}>
            <Spinner size="large" />
            <h1>{message || t('dashboard.messages.loading')}</h1>
        </div>
    ) : (
        children
    );
}
