import JSZip from 'jszip';

import { ContentMetadata } from '@genaism/services/content/contentTypes';
import { addContent } from '@genaism/services/content/content';
import { LogEntry, UserProfile } from '@genaism/services/profiler/profilerTypes';
import { addUserProfile, appendActionLog } from '@genaism/services/profiler/profiler';
import { UserNodeId } from '../graph/graphTypes';
import { GraphExport } from '../graph/state';
import { addNodes } from '../graph/nodes';
import { addEdges } from '../graph/edges';

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

interface LogItem {
    id: UserNodeId;
    log: LogEntry[];
}

export async function loadFile(file: File | Blob): Promise<void> {
    const zip = await JSZip.loadAsync(file);

    console.log('Loading file');

    const images = new Map<string, string>();
    const store: { meta: ContentMetadata[]; users: UserProfile[]; logs: LogItem[]; graph?: GraphExport } = {
        meta: [],
        users: [],
        logs: [],
    };

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
        } else if (data.name === 'logs.json') {
            promises.push(
                data.async('string').then((r) => {
                    store.logs = JSON.parse(r);
                })
            );
        } else if (data.name === 'graph.json') {
            promises.push(
                data.async('string').then((r) => {
                    store.graph = JSON.parse(r);
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

    if (store.graph) {
        addNodes(store.graph.nodes);
        addEdges(store.graph.edges);
        console.log('Graph loaded');
    }

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

    store.logs.forEach((l) => {
        appendActionLog(l.log, l.id);
    });
}
