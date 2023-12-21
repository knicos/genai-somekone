import { menuShowUserData } from '@genaism/state/menuState';
import { useRecoilState } from 'recoil';
import AppPanel from '../AppPanel/AppPanel';
import { getNodeData } from '@genaism/services/graph/nodes';
import Profile from '../DataProfile/DataProfile';

interface UserData {
    name: string;
}

export default function DataPanel() {
    const [showData, setShowData] = useRecoilState(menuShowUserData);

    return showData ? (
        <AppPanel
            title={getNodeData<UserData>(showData)?.name}
            onClose={() => setShowData(undefined)}
        >
            <Profile id={showData} />
        </AppPanel>
    ) : null;
}
