import { menuSelectedUser, menuShowUserPanel } from '@genaism/state/menuState';
import { useRecoilState, useRecoilValue } from 'recoil';
import AppPanel from '../AppPanel/AppPanel';
import { getNodeData } from '@genaism/services/graph/nodes';
import RecommendationsProfile from '../RecommendationsProfile/RecommendationsProfile';

interface UserData {
    name: string;
}

export default function RecommendationsPanel() {
    const [panel, setPanel] = useRecoilState(menuShowUserPanel);
    const selectedUser = useRecoilValue(menuSelectedUser);

    return panel === 'recommendations' && selectedUser ? (
        <AppPanel
            title={getNodeData<UserData>(selectedUser)?.name}
            onClose={() => setPanel('none')}
            data-testid="recom-panel"
        >
            <RecommendationsProfile id={selectedUser} />
        </AppPanel>
    ) : null;
}
