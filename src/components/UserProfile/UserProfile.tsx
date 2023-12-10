import { useUserProfile } from '@genaism/services/profiler/hooks';
import style from './style.module.css';
import WordCloud from '../WordCloud/WordCloud';
import topicSummary from './topicSummary';
import { useCallback, useMemo, useState } from 'react';
import TopicPie from '../TopicPie/TopicPie';
import { useTranslation } from 'react-i18next';
import { UserNodeId } from '@genaism/services/graph/graphTypes';

interface Props {
    id?: UserNodeId;
}

export default function Profile({ id }: Props) {
    const { t } = useTranslation();
    const [wcSize, setWCSize] = useState(300);
    const profile = useUserProfile(id);

    const topics = useMemo(() => {
        return topicSummary(profile);
    }, [profile]);

    const doResize = useCallback((size: number) => {
        setWCSize(size);
    }, []);

    return (
        <div className={style.container}>
            <div>
                <svg
                    width="100%"
                    height="300px"
                    viewBox={`${-(wcSize * 1.67)} ${-wcSize} ${wcSize * 1.67 * 2} ${wcSize * 2}`}
                >
                    <WordCloud
                        content={profile.taste}
                        size={300}
                        colour="#d9e3cf"
                        className={style.word}
                        onSize={doResize}
                    />
                </svg>
            </div>
            <TopicPie
                title={t('profile.titles.sharingPreference')}
                summary={topics.shared}
            />
            <TopicPie
                title={t('profile.titles.followPreference')}
                summary={topics.followed}
            />
            <TopicPie
                title={t('profile.titles.commentPreference')}
                summary={topics.commented}
            />
            <TopicPie
                title={t('profile.titles.reactPreference')}
                summary={topics.reacted}
            />
            <TopicPie
                title={t('profile.titles.viewPreference')}
                summary={topics.viewed}
            />
        </div>
    );
}
