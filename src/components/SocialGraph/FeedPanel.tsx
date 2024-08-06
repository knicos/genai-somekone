import { menuAllowFeedActions, menuSelectedUser, menuShowUserPanel } from '@genaism/state/menuState';
import { useRecoilState, useRecoilValue } from 'recoil';
import AppPanel from '../AppPanel/AppPanel';
import Feed from '../Feed/Feed';
import { useProfilerService } from '@genaism/hooks/services';

export default function FeedPanel() {
    const [panel, setPanel] = useRecoilState(menuShowUserPanel);
    const profiler = useProfilerService();
    const selectedUser = useRecoilValue(menuSelectedUser);
    const allowActions = useRecoilValue(menuAllowFeedActions);

    return panel === 'feed' && selectedUser ? (
        <AppPanel
            title={profiler.getUserData(selectedUser)?.name}
            onClose={() => setPanel('none')}
            data-testid="feed-panel"
        >
            <Feed
                id={selectedUser}
                noLog={!allowActions}
                noActions={!allowActions}
            />
        </AppPanel>
    ) : null;
}
