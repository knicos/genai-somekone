import ViewContainer from './ViewContainer';
import { useParams } from 'react-router-dom';
import ImageDetail from '@genaism/apps/Somegram/views/ImageDetail/ImageDetail';
import { ContentNodeId } from '@knicos/genai-recom';

export function Component() {
    const { contentId } = useParams();

    return (
        <ViewContainer>
            <ImageDetail id={contentId as ContentNodeId} />
        </ViewContainer>
    );
}
