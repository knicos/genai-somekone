import { menuShowFeed } from '@genaism/state/menuState';
import { useRecoilState } from 'recoil';
import AppPanel from '../AppPanel/AppPanel';
import Feed from '../Feed/Feed';
import { getNodeData } from '@genaism/services/graph/nodes';

interface UserData {
    name: string;
}

export default function FeedPanel() {
    const [showFeed, setShowFeed] = useRecoilState(menuShowFeed);

    return showFeed ? (
        <AppPanel
            title={getNodeData<UserData>(showFeed)?.name}
            onClose={() => setShowFeed(undefined)}
        >
            <Feed
                id={showFeed}
                noLog
                noActions
            />
        </AppPanel>
    ) : null;
}
