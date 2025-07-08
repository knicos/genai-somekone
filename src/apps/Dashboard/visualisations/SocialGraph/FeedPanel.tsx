import { menuAllowFeedActions, menuSelectedUser, menuShowUserPanel } from '@genaism/apps/Dashboard/state/menuState';
import { useAtom, useAtomValue } from 'jotai';
import { AppPanel } from '@genaism/apps/Dashboard/components/AppPanel';
import Feed from '@genaism/common/views/Feed/Feed';
import { useProfilerService } from '@genaism/hooks/services';

export default function FeedPanel() {
    const [panel, setPanel] = useAtom(menuShowUserPanel);
    const profiler = useProfilerService();
    const selectedUser = useAtomValue(menuSelectedUser);
    const allowActions = useAtomValue(menuAllowFeedActions);

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
