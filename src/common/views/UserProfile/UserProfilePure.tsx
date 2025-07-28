import WordCloud from '../../visualisations/WordCloud/WordCloud';
import style from './style.module.css';
import TopicDetail, { TopicData } from './TopicDetail';
import { Card, Cards } from '@genaism/common/components/DataCard';
import TopicPie from '@genaism/common/components/TopicPie/TopicPie';
import { useTranslation } from 'react-i18next';
import { ForwardedRef, forwardRef, RefObject, useCallback, useState } from 'react';
import { WeightedLabel } from '@genai-fi/recom';
import { TopicSummary } from './topicSummary';

interface Props {
    engagement: number;
    topics: TopicData[];
    wordCloud: WeightedLabel[];
    summary?: TopicSummary;
    wordCloudSize?: number;
    imageCloudSize?: number;
    ref?: RefObject<SVGSVGElement>;
}

export const UserProfilePure = forwardRef(function UserProfilePure(
    { wordCloudSize = 300, imageCloudSize = 200, engagement, topics, wordCloud, summary }: Props,
    ref: ForwardedRef<SVGSVGElement>
) {
    const { t } = useTranslation();
    const [wcSize, setWCSize] = useState(wordCloudSize);

    const doResize = useCallback((size: number) => {
        setWCSize(size);
    }, []);

    return (
        <>
            <div className={style.svgContainer}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="100%"
                    height={`${wordCloudSize}px`}
                    ref={ref}
                    viewBox={`${-(wcSize * 1.67)} ${-wcSize} ${wcSize * 1.67 * 2} ${wcSize * 2}`}
                >
                    <WordCloud
                        content={wordCloud}
                        size={wordCloudSize}
                        className={style.word}
                        onSize={doResize}
                    />
                </svg>
            </div>
            {summary && (
                <Cards>
                    <Card
                        title={t('profile.titles.engagement')}
                        score={engagement}
                    />
                    {topics.map((t) => (
                        <TopicDetail
                            key={t.topic}
                            data={t}
                            size={imageCloudSize}
                        />
                    ))}
                    <TopicPie
                        title={t('profile.titles.sharingPreference')}
                        summary={summary.shared}
                        percent={summary.sharedPercent}
                    />
                    <TopicPie
                        title={t('profile.titles.followPreference')}
                        summary={summary.followed}
                        percent={summary.followedPercent}
                    />
                    <TopicPie
                        title={t('profile.titles.commentPreference')}
                        summary={summary.commented}
                        percent={summary.commentedPercent}
                    />
                    <TopicPie
                        title={t('profile.titles.reactPreference')}
                        summary={summary.reacted}
                        percent={summary.reactedPercent}
                    />
                    <TopicPie
                        title={t('profile.titles.viewPreference')}
                        summary={summary.viewed}
                        percent={summary.viewedPercent}
                    />
                </Cards>
            )}
        </>
    );
});
