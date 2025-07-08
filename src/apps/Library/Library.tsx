import { createSearchParams } from 'react-router-dom';
import style from './style.module.css';
import { compressToEncodedURIComponent } from 'lz-string';
import ContentItem from './ContentItem';
import { Privacy } from '@genai-fi/base';
import gitInfo from '../../generatedGitInfo.json';
import { useTranslation } from 'react-i18next';

export function Component() {
    const { t } = useTranslation(['dashboard']);

    return (
        <main className={style.outerContainer}>
            <div className={style.container}>
                <header>
                    <h1>{t('library.title')}</h1>
                </header>
                <ul className={style.grid}>
                    <ContentItem
                        title={t('library.guidedDefault.title')}
                        image="/images/guidedDefault.jpg"
                        url={`/dashboard/socialgraph?${createSearchParams({
                            guide: 'default',
                            content: compressToEncodedURIComponent(
                                JSON.stringify(['https://store.gen-ai.fi/somekone/reettaSet1.zip'])
                            ),
                        })}`}
                        description={t('library.guidedDefault.description')}
                    />
                    <ContentItem
                        title={t('library.reetta.title')}
                        image="/images/reetta1.jpg"
                        url={`/dashboard/socialgraph?${createSearchParams({
                            content: compressToEncodedURIComponent(
                                JSON.stringify(['https://store.gen-ai.fi/somekone/reettaSet1.zip'])
                            ),
                        })}`}
                        description={t('library.reetta.description')}
                    />
                    <ContentItem
                        title={t('library.public.title')}
                        image="/images/publicDemo.jpg"
                        url={`/dashboard/usergrid?${createSearchParams({
                            cfg: compressToEncodedURIComponent(
                                JSON.stringify({
                                    applicationConfig: {
                                        disablePrinting: true,
                                        automaticUsername: true,
                                        limitSessions: true,
                                    },
                                })
                            ),
                            noSession: 'true',
                        })}`}
                        description={t('library.public.description')}
                    />
                    <ContentItem
                        title={t('library.example.title')}
                        image="/images/demoData.jpg"
                        url={`/dashboard/socialgraph?${createSearchParams({
                            content: compressToEncodedURIComponent(
                                JSON.stringify([
                                    'https://store.gen-ai.fi/somekone/imageSet1c.zip',
                                    'https://store.gen-ai.fi/somekone/sm_demo1c.zip',
                                ])
                            ),
                        })}`}
                        description={t('library.example.description')}
                    />
                    <ContentItem
                        title={t('library.generic.title')}
                        image="/images/defaultContent.jpg"
                        url="/dashboard"
                        description={t('library.generic.description')}
                    />
                    <ContentItem
                        title={t('library.blank.title')}
                        image="/images/blank.jpg"
                        url={`/dashboard/contentwizard?${createSearchParams({
                            content: '',
                            cfg: compressToEncodedURIComponent(JSON.stringify({ ui: { showShareCode: false } })),
                            noSession: 'true',
                        })}`}
                        description={t('library.blank.description')}
                    />
                </ul>
            </div>
            <Privacy
                appName="somekone"
                tag={gitInfo.gitTag || 'notag'}
            />
        </main>
    );
}

/*
<ContentItem
                        title={t('library.kiosk.title')}
                        image="/images/kiosk.jpg"
                        url={`/dashboard/usergrid?${createSearchParams({
                            content: compressToEncodedURIComponent(
                                JSON.stringify([
                                    'https://store.gen-ai.fi/somekone/imageSet1c.zip',
                                    'https://store.gen-ai.fi/somekone/sm_demo1c.zip',
                                ])
                            ),
                            guide: 'kiosk',
                        })}`}
                        description={t('library.kiosk.description')}
                    />
*/
