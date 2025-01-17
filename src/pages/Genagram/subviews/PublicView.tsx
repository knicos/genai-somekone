import { useParams } from 'react-router';
import ViewContainer from './ViewContainer';
import OwnProfile from '@genaism/views/PersonalProfile/PersonalProfile';
import { isUserID } from '@knicos/genai-recom';

export function Component() {
    const { userId } = useParams();

    return (
        <ViewContainer>
            <OwnProfile id={userId && isUserID(userId) ? userId : undefined} />
        </ViewContainer>
    );
}
