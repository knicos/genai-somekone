import { getContentData } from '@genaism/services/content/content';
import { ContentNodeId } from '@genaism/services/graph/graphTypes';

interface Props {
    content: ContentNodeId;
}

export default function ImageStyle({ content }: Props) {
    return (
        <>
            <header>
                <h1>What style is the image?</h1>
            </header>
            <div>
                <img
                    src={getContentData(content)}
                    width={300}
                    height={300}
                />
            </div>
        </>
    );
}
