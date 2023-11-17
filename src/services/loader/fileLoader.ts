import JSZip from 'jszip';

import { ContentMetadata } from '@genaism/services/content/contentTypes';
import { addContent } from '@genaism/services/content/content';

export async function loadFile(file: File | Blob): Promise<void> {
    const zip = await JSZip.loadAsync(file);

    const images = new Map<string, string>();
    const store: { meta: ContentMetadata[] } = { meta: [] };

    const promises: Promise<void>[] = [];

    zip.forEach((_, data: JSZip.JSZipObject) => {
        if (data.name === 'content.json') {
            promises.push(
                data.async('string').then((r) => {
                    store.meta = JSON.parse(r);
                })
            );
        } else {
            const parts = data.name.split('/');
            if (parts.length === 2 && !!parts[1] && parts[0] === 'images') {
                const split1 = parts[1].split('.');
                if (split1.length === 2) {
                    promises.push(
                        data.async('base64').then((s) => {
                            images.set(split1[0], `data:image/jpeg;base64,${s}`);
                        })
                    );
                }
            }
        }
    });

    await Promise.all(promises);

    store.meta.forEach((v) => {
        addContent(images.get(v.id) || '', v);
    });
}
