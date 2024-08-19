import style from './style.module.css';
import WordCloud from '../WordCloud/WordCloud';
import topicSummary from './topicSummary';
import { useCallback, useMemo, useRef, useState } from 'react';
import TopicPie from '../TopicPie/TopicPie';
import { useTranslation } from 'react-i18next';

import Cards from '../DataCard/Cards';
import Card from '../DataCard/Card';
import TopicDetail from './TopicDetail';
import { ContentNodeId, getTopicLabel, UserNodeId, WeightedNode } from '@knicos/genai-recom';
import { useProfilerService } from '@genaism/hooks/services';
import { useUserProfile } from '@genaism/hooks/profiler';
import { svgToPNG } from '@genaism/util/svgToPNG';
import { saveAs } from 'file-saver';
import { IconButton } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

interface Props {
    id?: UserNodeId;
}

export default function Profile({ id }: Props) {
    const { t } = useTranslation();
    const [wcSize, setWCSize] = useState(300);
    const profiler = useProfilerService();
    const aid = id || profiler.getCurrentUser();
    const profile = useUserProfile(aid);
    const svgRef = useRef<SVGSVGElement>(null);

    const doSave = () => {
        if (svgRef.current) {
            svgToPNG(svgRef.current, 4).then((data) => {
                saveAs(data, `wordcloud_${profile.name}.png`);
            });
        }
    };

    const topics = useMemo(() => {
        return topicSummary(profile);
    }, [profile]);

    const topicContent = useMemo(() => {
        const newMap = new Map<string, WeightedNode<ContentNodeId>[]>();
        let maxEngage = 0;
        const engaged = profiler.graph.getRelated('engaged', aid, { period: 20 * 60 * 1000 });
        engaged.forEach((e) => {
            if (e.weight === 0) return;
            maxEngage = Math.max(e.weight, maxEngage);
            const topics = profiler.graph.getRelated('topic', e.id, { count: 5 });
            topics.forEach((t) => {
                if (t.weight === 0) return;
                const label = getTopicLabel(t.id);
                const old = newMap.get(label) || [];
                old.push(e);
                newMap.set(label, old);
            });
        });
        return { map: newMap, max: maxEngage };
    }, [aid, profiler.graph]);

    const doResize = useCallback((size: number) => {
        setWCSize(size);
    }, []);

    const tasteSum = profile.affinities.topics.topics.reduce((sum, t) => sum + t.weight, 0);

    return (
        <div className={style.outerContainer}>
            <div
                className={style.container}
                tabIndex={0}
            >
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
                            content={profile.affinities.topics.topics}
                            size={300}
                            className={style.word}
                            onSize={doResize}
                        />
                    </svg>
                    <IconButton onClick={doSave}>
                        <DownloadIcon />
                    </IconButton>
                </div>
                <Cards>
                    <Card
                        title={t('profile.titles.engagement')}
                        score={Math.min(1, profile.engagement / (profiler.getBestEngagement() || 1))}
                    />
                    {profile &&
                        profile.affinities.topics.topics
                            .filter((t) => t.weight > 0)
                            .map((t) => (
                                <TopicDetail
                                    key={t.label}
                                    id={aid}
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
        </div>
    );
}
