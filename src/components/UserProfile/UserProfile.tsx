import { useUserProfile } from '@genaism/services/profiler/hooks';
import style from './style.module.css';
import WordCloud from '../WordCloud/WordCloud';
import topicSummary from './topicSummary';
import { useCallback, useMemo, useState } from 'react';
import TopicPie from '../TopicPie/TopicPie';
import { useTranslation } from 'react-i18next';
import { ContentNodeId, UserNodeId, WeightedNode } from '@genaism/services/graph/graphTypes';
import Cards from '../DataCard/Cards';
import Card from '../DataCard/Card';
import TopicDetail from './TopicDetail';
import { getRelated } from '@genaism/services/graph/query';
import { getTopicLabel } from '@genaism/services/concept/concept';
import { getBestEngagement } from '@genaism/services/profiler/profiler';

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

    const topicContent = useMemo(() => {
        const newMap = new Map<string, WeightedNode<ContentNodeId>[]>();
        let maxEngage = 0;
        const engaged = getRelated('engaged', profile.id, { period: 20 * 60 * 1000 });
        engaged.forEach((e) => {
            if (e.weight === 0) return;
            maxEngage = Math.max(e.weight, maxEngage);
            const topics = getRelated('topic', e.id, { count: 5 });
            topics.forEach((t) => {
                if (t.weight === 0) return;
                const label = getTopicLabel(t.id);
                const old = newMap.get(label) || [];
                old.push(e);
                newMap.set(label, old);
            });
        });
        return { map: newMap, max: maxEngage };
    }, [profile]);

    const doResize = useCallback((size: number) => {
        setWCSize(size);
    }, []);

    const tasteSum = profile.topics.reduce((sum, t) => sum + t.weight, 0);

    return (
        <div
            className={style.container}
            tabIndex={0}
        >
            <div>
                <svg
                    width="100%"
                    height="300px"
                    viewBox={`${-(wcSize * 1.67)} ${-wcSize} ${wcSize * 1.67 * 2} ${wcSize * 2}`}
                >
                    <WordCloud
                        content={profile.topics}
                        size={300}
                        className={style.word}
                        onSize={doResize}
                    />
                </svg>
            </div>
            <Cards>
                <Card
                    title={t('profile.titles.engagement')}
                    score={Math.min(1, profile.engagement / (getBestEngagement() || 1))}
                />
                {profile &&
                    profile.topics
                        .filter((t) => t.weight > 0)
                        .map((t) => (
                            <TopicDetail
                                key={t.label}
                                id={profile.id}
                                topic={t.label}
                                score={t.weight / tasteSum}
                                topicContent={topicContent.map}
                                maxEngage={topicContent.max}
                            />
                        ))}
                <TopicPie
                    title={t('profile.titles.sharingPreference')}
                    summary={topics.shared}
                    percent={topics.sharedPercent}
                />
                <TopicPie
                    title={t('profile.titles.followPreference')}
                    summary={topics.followed}
                    percent={topics.followedPercent}
                />
                <TopicPie
                    title={t('profile.titles.commentPreference')}
                    summary={topics.commented}
                    percent={topics.commentedPercent}
                />
                <TopicPie
                    title={t('profile.titles.reactPreference')}
                    summary={topics.reacted}
                    percent={topics.reactedPercent}
                />
                <TopicPie
                    title={t('profile.titles.viewPreference')}
                    summary={topics.viewed}
                    percent={topics.viewedPercent}
                />
            </Cards>
        </div>
    );
}
