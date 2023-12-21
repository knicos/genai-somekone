import { menuSelectedUser, menuShowUserPanel } from '@genaism/state/menuState';
import { useRecoilState, useRecoilValue } from 'recoil';
import AppPanel from '../AppPanel/AppPanel';
import { getNodeData } from '@genaism/services/graph/nodes';
import Profile from '../UserProfile/UserProfile';

interface UserData {
    name: string;
}

export default function ProfilePanel() {
    const [panel, setPanel] = useRecoilState(menuShowUserPanel);
    const selectedUser = useRecoilValue(menuSelectedUser);

    return panel === 'profile' && selectedUser ? (
        <AppPanel
            title={getNodeData<UserData>(selectedUser)?.name}
            onClose={() => setPanel('none')}
            data-testid="profile-panel"
        >
            <Profile id={selectedUser} />
        </AppPanel>
    ) : null;
}
