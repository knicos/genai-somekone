import { useParams, useSearchParams } from 'react-router-dom';
import { Workspace } from '../Dashboard/Workspace';

export function Component() {
    const [params] = useSearchParams();
    const { guide } = useParams();

    return (
        <Workspace
            contentUrls={params.get('content') || undefined}
            cfg={params.get('cfg') || undefined}
            guide={guide || undefined}
        />
    );
}
