import { menuSelectedUser, menuShowUserPanel } from '@genaism/apps/Dashboard/state/menuState';
import { useAtom, useAtomValue } from 'jotai';
import { AppPanel } from '@genaism/apps/Dashboard/components/AppPanel';
import RecommendationsProfile from '@genaism/common/views/RecommendationsProfile/RecommendationsProfile';
import { useProfilerService } from '@genaism/hooks/services';

export default function RecommendationsPanel() {
    const [panel, setPanel] = useAtom(menuShowUserPanel);
    const selectedUser = useAtomValue(menuSelectedUser);
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
