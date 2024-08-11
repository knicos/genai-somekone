import { ContentMetadata, ContentNodeId } from '@knicos/genai-recom';
import { useContentService } from './services';
import { useEffect, useReducer, useState } from 'react';

export function useContentData(id?: ContentNodeId) {
    const service = useContentService();
    const [data, setData] = useState(id ? service.getContentData(id) : undefined);

    useEffect(() => {
        const handler = () => {
            if (id) setData(service.getContentData(id));
        };
        if (id) {
            service.broker.on(`contentupdate-${id}`, handler);
        }
        return () => {
            if (id) {
                service.broker.off(`contentupdate-${id}`, handler);
            }
        };
    }, [service, id]);

    return data;
}

export function useContent(id?: ContentNodeId): [ContentMetadata | undefined, string | undefined] {
    const service = useContentService();
    const [data, setData] = useState(id ? service.getContentData(id) : undefined);

    useEffect(() => {
        const handler = () => {
            if (id) setData(service.getContentData(id));
        };
        if (id) {
            service.broker.on(`contentupdate-${id}`, handler);
        }
        return () => {
            if (id) {
                service.broker.off(`contentupdate-${id}`, handler);
            }
        };
    }, [service, id]);

    return id ? [service.getContentMetadata(id), data] : [undefined, undefined];
}

export function useAllContent() {
    const [, trigger] = useReducer((v) => v + 1, 0);
    const service = useContentService();
    useEffect(() => {
        const handler = () => trigger();
        service.broker.on('contentupdate', handler);
        return () => {
            service.broker.off('contentupdate', handler);
        };
    }, [service]);
    return service;
}
