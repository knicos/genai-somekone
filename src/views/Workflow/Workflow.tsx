import { IConnection, Widget, WorkflowLayout } from '@genaism/components/WorkflowLayout';
import { menuSelectedUser } from '@genaism/state/menuState';
import { useRecoilValue } from 'recoil';
import Feed from '../Feed/Feed';
import DataProfile from '../DataProfile/DataProfile';
import UserProfile from '../UserProfile/UserProfile';
import { I18nextProvider } from 'react-i18next';
import i18n from '@genaism/i18n';
import RecommendationsHeatmap from '@genaism/visualisations/RecommendationsHeatmap/RecommendationsHeatmap';
import MiniClusterGraph from '@genaism/visualisations/MiniClusterGraph/MiniClusterGraph';
import { useProfilerService } from '@genaism/hooks/services';

const connections: IConnection[] = [
    { start: 'feed', end: 'data', startPoint: 'right', endPoint: 'left' },
    { start: 'data', end: 'profile', startPoint: 'right', endPoint: 'left' },
    { start: 'profile', end: 'recommendations', startPoint: 'right', endPoint: 'left' },
];

export default function Workflow() {
    const profiler = useProfilerService();
    const selectedUser = useRecoilValue(menuSelectedUser);
    const name = selectedUser ? profiler.getUserName(selectedUser) : 'No User';

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
                        id={selectedUser}
                        noHeader
                        alwaysActive
                    />
                </Widget>
                <Widget
                    title="Data"
                    dataWidget="data"
                    style={{ maxWidth: '400px' }}
                    contentStyle={{ maxHeight: '600px' }}
                    noPadding
                >
                    <DataProfile
                        id={selectedUser}
                        disableMenu
                        noImageCloud
                    />
                </Widget>
                <Widget
                    title="Profile"
                    dataWidget="profile"
                    style={{ maxWidth: '350px' }}
                    contentStyle={{ maxHeight: '600px' }}
                    noPadding
                >
                    <UserProfile
                        id={selectedUser}
                        disableMenu
                        noTagSummary
                    />
                </Widget>
                <Widget
                    title="Cluster"
                    dataWidget="cluster"
                    style={{ maxWidth: '350px' }}
                    contentStyle={{ maxHeight: '400px' }}
                    noPadding
                >
                    {selectedUser && (
                        <div style={{ position: 'relative', width: '300px', height: '300px' }}>
                            <MiniClusterGraph userId={selectedUser} />
                        </div>
                    )}
                </Widget>
                <Widget
                    title="Recommendations"
                    dataWidget="recommendations"
                    style={{ width: '600px' }}
                    contentStyle={{ height: '600px' }}
                    noPadding
                >
                    {selectedUser && (
                        <RecommendationsHeatmap
                            user={selectedUser}
                            dimensions={20}
                        />
                    )}
                </Widget>
            </WorkflowLayout>
        </I18nextProvider>
    );
}
