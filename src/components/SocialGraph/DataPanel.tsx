import { menuSelectedUser, menuShowUserPanel } from '@genaism/state/menuState';
import { useRecoilState, useRecoilValue } from 'recoil';
import AppPanel from '../AppPanel/AppPanel';
import Profile from '../DataProfile/DataProfile';
import { getUserData } from '@genaism/services/users/users';

export default function DataPanel() {
    const [panel, setPanel] = useRecoilState(menuShowUserPanel);
    const selectedUser = useRecoilValue(menuSelectedUser);

    return panel === 'data' && selectedUser ? (
        <AppPanel
            title={getUserData(selectedUser)?.name}
            onClose={() => setPanel('none')}
            data-testid="data-panel"
        >
            <Profile id={selectedUser} />
        </AppPanel>
    ) : null;
}
