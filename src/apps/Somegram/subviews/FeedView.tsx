import Feed from '@genaism/common/views/Feed/Feed';
import { useFeedProtocol } from '../../../protocol/FeedProtocol';
import { useRecoilValue } from 'recoil';
import { SMConfig } from '@genaism/common/state/smConfig';
import { appConfiguration } from '@genaism/common/state/configState';

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
