import { CommentEntry, ContentMetadata, ContentNodeId } from '@genai-fi/recom';
import { useContentService, useServiceEventMemo } from './services';
import { useEffect, useState } from 'react';

export function useContentData(id?: ContentNodeId) {
    const service = useContentService();
    const [data, setData] = useState<string | undefined>();

    useEffect(() => {
        if (id) {
            const cid = id;
            const handler = () => {
                setData(service.getContentData(cid));
            };
            service.broker.on(`contentupdate-${cid}`, handler);
            setData(service.getContentData(cid));
            return () => {
                service.broker.off(`contentupdate-${cid}`, handler);
            };
        }
    }, [service, id]);

    return data;
}

export function useContentComments(id: ContentNodeId) {
    const service = useContentService();
    const [comments, setComments] = useState<CommentEntry[]>([]);

    useEffect(() => {
        if (id) {
            const cid = id;
            const handler = () => {
                setComments([...service.getComments(cid)]);
            };

            service.broker.on(`contentcomment-${cid}`, handler);
            setComments([...service.getComments(cid)]);

            return () => {
                service.broker.off(`contentcomment-${cid}`, handler);
            };
        }
    }, [service, id]);

    return comments;
}

export function useContentStats(id: ContentNodeId) {
    const service = useContentService();
    const [reactions, setReactions] = useState(0);
    const [shares, setShares] = useState(0);

    useEffect(() => {
        if (id) {
            const cid = id;
            const handler = () => {
                const stats = service.getContentStats(cid);
                setReactions(stats.reactions);
                setShares(stats.shares);
            };

            service.broker.on(`contentstats-${cid}`, handler);
            const stats = service.getContentStats(cid);
            setReactions(stats.reactions);
            setShares(stats.shares);

            return () => {
                service.broker.off(`contentstats-${cid}`, handler);
            };
        }
    }, [service, id]);

    return { reactions, shares };
}

export function useContent(id?: ContentNodeId): [ContentMetadata | undefined, string | undefined] {
    const service = useContentService();

    const data = useServiceEventMemo(
        () => {
            if (id) return service.getContentData(id);
        },
        [service, id],
        `contentupdate-${id || 'content:dummy'}`
    );

    const meta = useServiceEventMemo(
        () => {
            if (id) return service.getContentMetadata(id);
        },
        [service, id],
        `contentmeta-${id || 'content:dummy'}`
    );

    return [meta, data];
}

export function useAllContent() {
    const service = useContentService();
    return useServiceEventMemo(
        () => {
            return service.getAllContent();
        },
        [service],
        'contentupdate'
    );
}
