import { menuSelectedUser, menuShowUserPanel } from '@genaism/apps/Dashboard/state/menuState';
import { useRecoilState, useRecoilValue } from 'recoil';
import { AppPanel } from '@genaism/apps/Dashboard/components/AppPanel';
import Profile from '@genaism/common/views/UserProfile/UserProfile';
import { useProfilerService } from '@genaism/hooks/services';

export default function ProfilePanel() {
    const [panel, setPanel] = useRecoilState(menuShowUserPanel);
    const selectedUser = useRecoilValue(menuSelectedUser);
    const profiler = useProfilerService();

    return panel === 'profile' && selectedUser ? (
        <AppPanel
            title={profiler.getUserData(selectedUser)?.name}
            onClose={() => setPanel('none')}
            data-testid="profile-panel"
        >
            <Profile id={selectedUser} />
        </AppPanel>
    ) : null;
}
