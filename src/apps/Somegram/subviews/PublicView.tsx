import { useParams } from 'react-router-dom';
import ViewContainer from './ViewContainer';
import OwnProfile from '@genaism/apps/Somegram/views/PersonalProfile/PersonalProfile';
import { isUserID } from '@genai-fi/recom';

export function Component() {
    const { userId } = useParams();

    return (
        <ViewContainer>
            <OwnProfile id={userId && isUserID(userId) ? userId : undefined} />
        </ViewContainer>
    );
}
