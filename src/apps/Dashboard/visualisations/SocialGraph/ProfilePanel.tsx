import { menuSelectedUser, menuShowUserPanel } from '@genaism/apps/Dashboard/state/menuState';
import { useAtom, useAtomValue } from 'jotai';
import { AppPanel } from '@genaism/apps/Dashboard/components/AppPanel';
import Profile from '@genaism/common/views/UserProfile/UserProfile';
import { useProfilerService } from '@genaism/hooks/services';

export default function ProfilePanel() {
    const [panel, setPanel] = useAtom(menuShowUserPanel);
    const selectedUser = useAtomValue(menuSelectedUser);
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
