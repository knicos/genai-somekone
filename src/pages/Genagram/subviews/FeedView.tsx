import Feed from '@genaism/views/Feed/Feed';
import { useFeedProtocol } from '../FeedProtocol';
import { useRecoilValue } from 'recoil';
import { SMConfig } from '@genaism/state/smConfig';
import { appConfiguration } from '@genaism/state/settingsState';

function FeedWrapper() {
    const { doProfile, doRecommend } = useFeedProtocol();

    return (
        <Feed
            onProfile={doProfile}
            onRecommend={doRecommend}
        />
    );
}

export function Component() {
    const config = useRecoilValue<SMConfig>(appConfiguration);

    return config && <FeedWrapper />;
}
