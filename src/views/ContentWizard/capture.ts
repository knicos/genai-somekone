import { getImageSearch, SearchSource } from '@genaism/services/imageSearch/hook';
import { canvasFromURL } from '@knicos/genai-base';
import { ContentMetadata, ContentNodeId, ContentService } from '@knicos/genai-recom';

export default async function captureImages(
    contentSvc: ContentService,
    captureState: Set<ContentNodeId>,
    q: string,
    page: number,
    source: SearchSource,
    order: 'latest' | 'popular',
    count: number,
    size: number,
    onMetaCheck?: (meta: ContentMetadata) => boolean,
    onDataCheck?: (data: string) => boolean
) {
    const results = await getImageSearch(q, page, source, order);

    if (results) {
        let tally = count;

        const promises = results.results.map(async (image) => {
            if (contentSvc.hasContent(`content:${image.id}`)) return;
            if (captureState.has(`content:${image.id}`)) return;
            if (tally >= size) return;

            const meta: ContentMetadata = {
                id: image.id,
                labels: image.tags.map((t) => ({ label: t, weight: 1 })),
                author: image.author,
            };

            if (onMetaCheck && !onMetaCheck(meta)) return;

            return canvasFromURL(image.url, 500).then((canvas) => {
                const imageData = canvas.toDataURL('image/jpeg', 0.95);

                if (onDataCheck && !onDataCheck(imageData)) return;

                if (tally >= size) return;
                tally += 1;
                captureState.add(`content:${image.id}`);
                contentSvc.addContent(imageData, meta);
            });
        });

        return Promise.all(promises).then(() => tally);
    } else {
        return count;
    }
}
