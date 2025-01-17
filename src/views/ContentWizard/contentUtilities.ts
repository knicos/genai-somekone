import { ContentService, uniqueSubset } from '@knicos/genai-recom';

export function deleteWithTags(contentSvc: ContentService, tags: string[]) {
    const tagSet = new Set(tags);

    const allContent = contentSvc.getAllContent();
    allContent.forEach((c) => {
        const meta = contentSvc.getContentMetadata(c);
        if (meta) {
            for (let i = 0; i < meta.labels.length; ++i) {
                const label = meta.labels[i];
                if (tagSet.has(label.label)) {
                    contentSvc.removeContent(c);
                    break;
                }
            }
        }
    });
}

export function mergeTags(contentSvc: ContentService, tags: string[]) {
    const tagSet = new Set(tags);

    const allContent = contentSvc.getAllContent();
    allContent.forEach((c) => {
        const meta = contentSvc.getContentMetadata(c);
        if (meta) {
            for (let i = 0; i < meta.labels.length; ++i) {
                const label = meta.labels[i];
                if (tagSet.has(label.label)) {
                    label.label = tags[0];
                }
            }

            contentSvc.updateMeta(c, { labels: uniqueSubset(meta.labels, (n) => n.label) });
        }
    });

    contentSvc.rebuildContent();
}

export function renameTag(contentSvc: ContentService, oldName: string, newName: string) {
    const allContent = contentSvc.getAllContent();
    allContent.forEach((c) => {
        const meta = contentSvc.getContentMetadata(c);
        if (meta) {
            for (let i = 0; i < meta.labels.length; ++i) {
                const label = meta.labels[i];
                if (label.label === oldName) {
                    label.label = newName;
                }
            }

            contentSvc.updateMeta(c, { labels: uniqueSubset(meta.labels, (n) => n.label) });
        }
    });

    contentSvc.rebuildContent();
}

export function deleteTags(contentSvc: ContentService, tags: string[]) {
    const tagSet = new Set(tags);

    const allContent = contentSvc.getAllContent();
    allContent.forEach((c) => {
        const meta = contentSvc.getContentMetadata(c);
        if (meta) {
            contentSvc.updateMeta(c, { labels: meta.labels.filter((l) => !tagSet.has(l.label)) });
        }
    });

    contentSvc.rebuildContent();
}
