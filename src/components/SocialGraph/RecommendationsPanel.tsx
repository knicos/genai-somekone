import { menuSelectedUser, menuShowUserPanel } from '@genaism/state/menuState';
import { useRecoilState, useRecoilValue } from 'recoil';
import AppPanel from '../AppPanel/AppPanel';
import RecommendationsProfile from '../RecommendationsProfile/RecommendationsProfile';
import { useProfilerService } from '@genaism/hooks/services';

export default function RecommendationsPanel() {
    const [panel, setPanel] = useRecoilState(menuShowUserPanel);
    const selectedUser = useRecoilValue(menuSelectedUser);
    const profiler = useProfilerService();

    return panel === 'recommendations' && selectedUser ? (
        <AppPanel
            title={profiler.getUserData(selectedUser)?.name}
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
