import { useSearchParams } from 'react-router-dom';
import { Workspace } from './Workspace';

export function Component() {
    const [params] = useSearchParams();

    return (
        <Workspace
            contentUrls={params.get('content') || undefined}
            cfg={params.get('cfg') || undefined}
            experimental={!!params.get('experimental')}
        />
    );
}
