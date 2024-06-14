import { menuAllowFeedActions, menuSelectedUser, menuShowUserPanel } from '@genaism/state/menuState';
import { useRecoilState, useRecoilValue } from 'recoil';
import AppPanel from '../AppPanel/AppPanel';
import Feed from '../Feed/Feed';
import { getUserData } from '@genaism/services/users/users';

export default function FeedPanel() {
    const [panel, setPanel] = useRecoilState(menuShowUserPanel);
    const selectedUser = useRecoilValue(menuSelectedUser);
    const allowActions = useRecoilValue(menuAllowFeedActions);

    return panel === 'feed' && selectedUser ? (
        <AppPanel
            title={getUserData(selectedUser)?.name}
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
