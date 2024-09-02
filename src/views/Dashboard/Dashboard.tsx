import { useSearchParams } from 'react-router-dom';
import { Workspace } from './Workspace';

export function Component() {
    const [params] = useSearchParams();

    const content = params.get('content');
    const guide = params.get('guide');

    return (
        <Workspace
            contentUrls={content === null ? undefined : content}
            cfg={params.get('cfg') || undefined}
            experimental={!!params.get('experimental')}
            guide={guide || undefined}
        />
    );
}
