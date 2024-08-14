import ViewContainer from './ViewContainer';
import { useParams } from 'react-router';
import ImageDetail from '@genaism/components/ImageDetail/ImageDetail';
import { ContentNodeId } from '@knicos/genai-recom';

export function Component() {
    const { contentId } = useParams();

    return (
        <ViewContainer>
            <ImageDetail id={contentId as ContentNodeId} />
        </ViewContainer>
    );
}
