import style from './style.module.css';
import topicSummary from './topicSummary';
import { useMemo, useRef } from 'react';
import { TopicData } from './TopicDetail';
import { ContentNodeId, getTopicLabel, UserNodeId, WeightedNode } from '@genai-fi/recom';
import { useProfilerService } from '@genaism/hooks/services';
import { useUserProfile } from '@genaism/hooks/profiler';
import { saveAs } from 'file-saver';
import { UserProfilePure } from './UserProfilePure';
import PrintButton from '@genaism/common/components/PrintButton/PrintButton';
import { IconMenuInline, IconMenuItem } from '@genaism/common/components/IconMenu';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { appConfiguration } from '@genaism/common/state/configState';
import { svgToPNG } from '@genaism/util/svgToPNG';
import DownloadIcon from '@mui/icons-material/Download';
import { IconButton } from '@mui/material';

interface Props {
    id?: UserNodeId;
    disableMenu?: boolean;
    noTagSummary?: boolean;
}

export default function Profile({ id, disableMenu, noTagSummary }: Props) {
    const { t } = useTranslation();
    const profiler = useProfilerService();
    const aid = id || profiler.getCurrentUser();
    const profile = useUserProfile(aid);
    const appConfig = useAtomValue(appConfiguration);
    const svgRef = useRef<SVGSVGElement>(null);

    const summary = useMemo(() => {
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

    const tasteSum = profile.affinities.topics.topics.reduce((sum, t) => sum + t.weight, 0);

    const topics: TopicData[] = useMemo(() => {
        return profile
            ? profile.affinities.topics.topics
                  .filter((t) => t.weight > 0)
                  .map((t) => {
                      const contentItems = topicContent.map.get(t.label) || [];
                      return {
                          topic: t.label,
                          score: t.weight / tasteSum,
                          image:
                              contentItems.length > 0
                                  ? profiler.content.getContentData(contentItems[0].id, true)
                                  : undefined,
                          images:
                              topicContent.map.get(t.label)?.map((t) => ({
                                  weight: t.weight,
                                  image: profiler.content.getContentData(t.id, true) || '',
                              })) || [],
                      };
                  })
            : [];
    }, [profile, profiler, topicContent, tasteSum]);

    const doSave = () => {
        if (svgRef.current) {
            svgToPNG(svgRef.current, 4).then((data) => {
                saveAs(data, `wordcloud_${profile.name}.png`);
            });
        }
    };

    return (
        <div className={style.outerContainer}>
            <div
                className={style.container}
                tabIndex={0}
            >
                {!appConfig?.disablePrinting && !disableMenu && (
                    <IconMenuInline>
                        <IconMenuItem tooltip={t('profile.actions.print')}>
                            <PrintButton
                                ariaLabel={t('profile.actions.print')}
                                data={() => {
                                    return {
                                        title: profile.name,
                                        summary,
                                        topics,
                                        engagement: Math.min(
                                            1,
                                            profile.engagement / (profiler.getBestEngagement() || 1)
                                        ),
                                        wordCloud: profile.affinities.topics.topics,
                                    };
                                }}
                                path="profile"
                            />
                        </IconMenuItem>
                        <IconMenuItem tooltip={t('profile.actions.download')}>
                            <IconButton
                                onClick={doSave}
                                color="inherit"
                                aria-label={t('profile.actions.download')}
                            >
                                <DownloadIcon />
                            </IconButton>
                        </IconMenuItem>
                    </IconMenuInline>
                )}
                <UserProfilePure
                    ref={svgRef}
                    topics={topics}
                    summary={noTagSummary ? undefined : summary}
                    wordCloud={profile.affinities.topics.topics}
                    engagement={Math.min(1, profile.engagement / (profiler.getBestEngagement() || 1))}
                />
            </div>
        </div>
    );
}
