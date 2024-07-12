import { menuSelectedUser, menuShowUserPanel } from '@genaism/state/menuState';
import { useRecoilState, useRecoilValue } from 'recoil';
import AppPanel from '../AppPanel/AppPanel';
import RecommendationsProfile from '../RecommendationsProfile/RecommendationsProfile';
import { getUserData } from '@genaism/services/users/users';

export default function RecommendationsPanel() {
    const [panel, setPanel] = useRecoilState(menuShowUserPanel);
    const selectedUser = useRecoilValue(menuSelectedUser);

    return panel === 'recommendations' && selectedUser ? (
        <AppPanel
            title={getUserData(selectedUser)?.name}
            onClose={() => setPanel('none')}
            data-testid="recom-panel"
        >
            <RecommendationsProfile
                id={selectedUser}
                generate
            />
        </AppPanel>
    ) : null;
}
