import { IconButton } from '@mui/material';
import WordCloud from '../WordCloud/WordCloud';
import style from './style.module.css';
import DownloadIcon from '@mui/icons-material/Download';
import TopicDetail, { TopicData } from './TopicDetail';
import Cards from '../DataCard/Cards';
import Card from '../DataCard/Card';
import TopicPie from '../TopicPie/TopicPie';
import { useTranslation } from 'react-i18next';
import { useCallback, useRef, useState } from 'react';
import { svgToPNG } from '@genaism/util/svgToPNG';
import { WeightedLabel } from '@knicos/genai-recom';
import { TopicSummary } from './topicSummary';

interface Props {
    onSave?: (data: string) => void;
    engagement: number;
    topics: TopicData[];
    wordCloud: WeightedLabel[];
    summary: TopicSummary;
}

export function UserProfilePure({ engagement, topics, wordCloud, summary, onSave }: Props) {
    const { t } = useTranslation();
    const [wcSize, setWCSize] = useState(300);
    const svgRef = useRef<SVGSVGElement>(null);

    const doSave = () => {
        if (svgRef.current) {
            svgToPNG(svgRef.current, 4).then((data) => {
                if (onSave) onSave(data);
            });
        }
    };

    const doResize = useCallback((size: number) => {
        setWCSize(size);
    }, []);

    return (
        <>
            <div className={style.svgContainer}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="100%"
                    height="300px"
                    ref={svgRef}
                    viewBox={`${-(wcSize * 1.67)} ${-wcSize} ${wcSize * 1.67 * 2} ${wcSize * 2}`}
                >
                    <style>{'rect {opacity: 0.9; fill: #5f7377;} text { fill: white;}'}</style>
                    <WordCloud
                        content={wordCloud}
                        size={300}
                        className={style.word}
                        onSize={doResize}
                    />
                </svg>
                {onSave && (
                    <IconButton onClick={doSave}>
                        <DownloadIcon />
                    </IconButton>
                )}
            </div>
            <Cards>
                <Card
                    title={t('profile.titles.engagement')}
                    score={engagement}
                />
                {topics.map((t) => (
                    <TopicDetail
                        key={t.topic}
                        data={t}
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
        </>
    );
}
