import Feed from '@genaism/common/views/Feed/Feed';
import { useFeedProtocol } from '../../../protocol/FeedProtocol';
import { useAtomValue } from 'jotai';
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
    const config = useAtomValue<SMConfig>(appConfiguration);

    return config && <FeedWrapper />;
}
