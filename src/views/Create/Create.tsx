import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { compressToEncodedURIComponent } from 'lz-string';
import { SMConfig } from '../Genagram/smConfig';
import style from './style.module.css';

const DEFAULT_CONTENT = 'https://tmstore.blob.core.windows.net/projects/smTestContent1.zip';

// About
// Create new session
// Select content to use
// Select views to show children
// Start
export function Component() {
    const [url, setURL] = useState('');
    const [content] = useState(DEFAULT_CONTENT);
    const { t } = useTranslation();

    useEffect(() => {
        const configObj: SMConfig = {
            content,
        };
        const jsonstr = JSON.stringify(configObj);
        const component = compressToEncodedURIComponent(jsonstr);
        setURL(`/dashboard?c=${component}`);
    }, [content]);

    return (
        <section className={style.container}>
            <header>
                <h1>{t('creator.titles.main')}</h1>
            </header>
            <div className={style.actions}>
                <a href={url}>{t('creator.actions.create')}</a>
            </div>
        </section>
    );
}
