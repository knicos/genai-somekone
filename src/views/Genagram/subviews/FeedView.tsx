import Feed from '@genaism/components/Feed/Feed';
import { useFeedProtocol } from '../FeedProtocol';
import { useRecoilValue } from 'recoil';
import { SMConfig } from '@genaism/state/smConfig';
import { appConfiguration } from '@genaism/state/settingsState';

function FeedWrapper() {
    const { doProfile, doRecommend, doLog } = useFeedProtocol();

    return (
        <Feed
            onProfile={doProfile}
            onLog={doLog}
            onRecommend={doRecommend}
        />
    );
}

export function Component() {
    const config = useRecoilValue<SMConfig>(appConfiguration);

    return config && <FeedWrapper />;
}
