import { menuSelectedUser, menuShowUserPanel } from '@genaism/state/menuState';
import { useRecoilState, useRecoilValue } from 'recoil';
import AppPanel from '../AppPanel/AppPanel';
import Profile from '../UserProfile/UserProfile';
import { getUserData } from '@genaism/services/users/users';

export default function ProfilePanel() {
    const [panel, setPanel] = useRecoilState(menuShowUserPanel);
    const selectedUser = useRecoilValue(menuSelectedUser);

    return panel === 'profile' && selectedUser ? (
        <AppPanel
            title={getUserData(selectedUser)?.name}
            onClose={() => setPanel('none')}
            data-testid="profile-panel"
        >
            <Profile id={selectedUser} />
        </AppPanel>
    ) : null;
}
