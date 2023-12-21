import { menuShowUserProfile } from '@genaism/state/menuState';
import { useRecoilState } from 'recoil';
import AppPanel from '../AppPanel/AppPanel';
import { getNodeData } from '@genaism/services/graph/nodes';
import Profile from '../UserProfile/UserProfile';

interface UserData {
    name: string;
}

export default function ProfilePanel() {
    const [showProfile, setShowProfile] = useRecoilState(menuShowUserProfile);

    return showProfile ? (
        <AppPanel
            title={getNodeData<UserData>(showProfile)?.name}
            onClose={() => setShowProfile(undefined)}
        >
            <Profile id={showProfile} />
        </AppPanel>
    ) : null;
}
