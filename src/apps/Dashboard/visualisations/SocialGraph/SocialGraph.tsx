import SocialMenu from './SocialMenu';
import FeedPanel from './FeedPanel';
import DataPanel from './DataPanel';
import ProfilePanel from './ProfilePanel';
import RecommendationsPanel from './RecommendationsPanel';
import { UserNodeId } from '@genai-fi/recom';
import SocialGraphElement from './SocialGraphElement';

interface Props {
    liveUsers?: UserNodeId[];
}

export default function SocialGraph({ liveUsers }: Props) {
    return (
        <>
            <SocialGraphElement liveUsers={liveUsers} />
            <SocialMenu />
            <FeedPanel />
            <DataPanel />
            <ProfilePanel />
            <RecommendationsPanel />
        </>
    );
}
