import JSZip from 'jszip';

import { ContentMetadata } from '@genaism/services/content/contentTypes';
import { addContent } from '@genaism/services/content/content';
import { UserProfile } from '@genaism/services/profiler/profilerTypes';
import { addUserProfile } from '@genaism/services/profiler/profiler';

export async function getZipBlob(content: string | ArrayBuffer): Promise<Blob> {
    if (typeof content === 'string') {
        const result = await fetch(content);
        if (result.status !== 200) {
            console.error(result);
            throw new Error('zip_fetch_failed');
        }
        return result.blob();
    } else {
        return new Blob([content]);
    }
}

export async function loadFile(file: File | Blob): Promise<void> {
    const zip = await JSZip.loadAsync(file);

    console.log('Loading file');

    const images = new Map<string, string>();
    const store: { meta: ContentMetadata[]; users: UserProfile[] } = { meta: [], users: [] };

    const promises: Promise<void>[] = [];

    zip.forEach((_, data: JSZip.JSZipObject) => {
        if (data.name === 'content.json') {
            promises.push(
                data.async('string').then((r) => {
                    store.meta = JSON.parse(r);
                })
            );
        } else if (data.name === 'users.json') {
            promises.push(
                data.async('string').then((r) => {
                    store.users = JSON.parse(r);
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

    store.users.forEach((u) => {
        try {
            addUserProfile(u);
        } catch (e) {
            console.warn('User already exists');
        }
    });
}
