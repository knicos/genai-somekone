import { IConnection, Widget, WorkflowLayout } from '@genaism/common/components/WorkflowLayout';
import { menuSelectedUser } from '@genaism/apps/Dashboard/state/menuState';
import { useRecoilValue } from 'recoil';
import Feed from '../Feed/Feed';
import DataProfile from '../DataProfile/DataProfile';
import UserProfile from '../UserProfile/UserProfile';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from '@genaism/i18n';
import RecommendationsHeatmap from '@genaism/common/visualisations/RecommendationsHeatmap/RecommendationsHeatmap';
import MiniClusterGraph from '@genaism/common/visualisations/MiniClusterGraph/MiniClusterGraph';
import { useProfilerService } from '@genaism/hooks/services';
import { ScoredRecommendation, UserNodeData, UserNodeId } from '@knicos/genai-recom';
import style from './style.module.css';
import { configuration } from '@genaism/common/state/configState';
import Blackbox from './Blackbox';
import { useCallback, useEffect, useState } from 'react';

const connections: IConnection[] = [
    { start: 'feed', end: 'data', startPoint: 'right', endPoint: 'left' },
    { start: 'feed', end: 'blackbox', startPoint: 'right', endPoint: 'left' },
    { start: 'blackbox', end: 'recommendations', startPoint: 'right', endPoint: 'left' },
    { start: 'data', end: 'profile', startPoint: 'right', endPoint: 'left' },
    { start: 'profile', end: 'cluster', startPoint: 'bottom', endPoint: 'top' },
    { start: 'cluster', end: 'recommendations', startPoint: 'right', endPoint: 'left' },
];

interface Props {
    id?: UserNodeId;
    onProfile?: (profile: UserNodeData) => void;
    onRecommend?: (recommendations: ScoredRecommendation[]) => void;
    onLog?: () => void;
}

export default function Workflow({ id, onProfile, onRecommend, onLog }: Props) {
    const { t } = useTranslation('common');
    const profiler = useProfilerService();
    const selectedUser = useRecoilValue(menuSelectedUser);
    const aid = id || selectedUser;
    const name = aid ? profiler.getUserName(aid) : 'No User';
    const config = useRecoilValue(configuration(aid || 'user:'));
    const [spin, setSpin] = useState(false);

    const doLog = useCallback(() => {
        if (onLog) {
            onLog();
        }
        setSpin(true);
    }, [onLog]);

    useEffect(() => {
        if (spin) {
            const t = setTimeout(() => setSpin(false), 1000);
            return () => {
                clearTimeout(t);
            };
        }
    }, [spin]);

    return (
        <I18nextProvider
            i18n={i18n}
            defaultNS="common"
        >
            <WorkflowLayout connections={connections}>
                <Widget
                    title={name}
                    dataWidget="feed"
                    style={{ width: '400px' }}
                    contentStyle={{ height: '600px' }}
                    noPadding
                >
                    <Feed
                        id={aid}
                        noHeader
                        alwaysActive
                        onProfile={onProfile}
                        onRecommend={onRecommend}
                        onLog={doLog}
                    />
                </Widget>
                {config.blackboxWorkflow && <Blackbox spin={spin} />}
                {!config.blackboxWorkflow && (
                    <Widget
                        title={t('workflow.titles.data')}
                        dataWidget="data"
                        style={{ maxWidth: '350px' }}
                        contentStyle={{ maxHeight: '600px' }}
                        noPadding
                    >
                        <DataProfile
                            id={aid}
                            disableMenu
                            noImageCloud
                        />
                    </Widget>
                )}
                {!config.blackboxWorkflow && (
                    <div
                        data-widget="container"
                        className={style.widgetColumn}
                    >
                        <Widget
                            title={t('workflow.titles.profile')}
                            dataWidget="profile"
                            style={{ maxWidth: '350px' }}
                            contentStyle={{ maxHeight: '600px' }}
                            noPadding
                        >
                            <UserProfile
                                id={aid}
                                disableMenu
                                noTagSummary
                            />
                        </Widget>
                        <Widget
                            title={t('workflow.titles.cluster')}
                            dataWidget="cluster"
                            style={{ maxWidth: '350px' }}
                            contentStyle={{ maxHeight: '400px' }}
                            noPadding
                        >
                            {aid && (
                                <div style={{ position: 'relative', width: '300px', height: '300px' }}>
                                    <MiniClusterGraph userId={aid} />
                                </div>
                            )}
                        </Widget>
                    </div>
                )}
                <Widget
                    title={t('workflow.titles.map')}
                    dataWidget="recommendations"
                    style={{ width: '600px' }}
                    contentStyle={{ height: '600px' }}
                    noPadding
                >
                    {aid && (
                        <RecommendationsHeatmap
                            user={aid}
                            dimensions={20}
                        />
                    )}
                </Widget>
            </WorkflowLayout>
        </I18nextProvider>
    );
}
