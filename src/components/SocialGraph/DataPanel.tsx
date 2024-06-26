import { menuSelectedUser, menuShowUserPanel } from '@genaism/state/menuState';
import { useRecoilState, useRecoilValue } from 'recoil';
import AppPanel from '../AppPanel/AppPanel';
import { getNodeData } from '@genaism/services/graph/nodes';
import Profile from '../DataProfile/DataProfile';

interface UserData {
    name: string;
}

export default function DataPanel() {
    const [panel, setPanel] = useRecoilState(menuShowUserPanel);
    const selectedUser = useRecoilValue(menuSelectedUser);

    return panel === 'data' && selectedUser ? (
        <AppPanel
            title={getNodeData<UserData>(selectedUser)?.name}
            onClose={() => setPanel('none')}
            data-testid="data-panel"
        >
            <Profile id={selectedUser} />
        </AppPanel>
    ) : null;
}
