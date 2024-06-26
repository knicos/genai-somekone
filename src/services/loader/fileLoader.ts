import JSZip from 'jszip';

import { ContentMetadata } from '@genaism/services/content/contentTypes';
import { addContent } from '@genaism/services/content/content';
import { LogEntry, UserProfile } from '@genaism/services/profiler/profilerTypes';
import { addUserProfile, appendActionLog, getActionLog, getCurrentUser } from '@genaism/services/profiler/profiler';
import { NodeID, TopicNodeId, isTopicID } from '../graph/graphTypes';
import { GraphExport, dump } from '../graph/state';
import { addNodes } from '../graph/nodes';
import { addEdges } from '../graph/edges';
import { getTopicId } from '../concept/concept';
import { ProjectMeta, VERSION } from '../saver/types';
import { dependencies } from './tracker';
import { LogItem } from './loaderTypes';
import { findLargestEdgeTimestamp, findLargestLogTimestamp, rebaseEdges, rebaseLog } from './rebase';
import { SomekoneSettings } from '@genaism/hooks/settings';

const STATIC_PATH = 'https://store.gen-ai.fi/somekone/images';

interface TopicData {
    label: string;
}

export async function getZipBlob(content: string | ArrayBuffer, progress?: (percent: number) => void): Promise<Blob> {
    if (typeof content === 'string') {
        if (progress) progress(0);

        const result = await fetch(content);
        if (result.status !== 200) {
            console.error(result);
            throw new Error('zip_fetch_failed');
        }
        const parts: BlobPart[] = [];

        if (result.body) {
            const reader = result.body.getReader();

            const contentLength = parseInt(result.headers.get('Content-Length') || '1');

            let receivedLength = 0;

            while (receivedLength < contentLength) {
                const { done, value } = await reader.read();

                if (done) {
                    break;
                }

                parts.push(value);
                receivedLength += value.length;
                if (progress) progress(Math.floor((receivedLength / contentLength) * 100));
            }
        }

        return new Blob(parts);
    } else {
        if (progress) progress(100);
        return new Blob([content]);
    }
}

export async function loadFile(file: File | Blob): Promise<SomekoneSettings | undefined> {
    const zip = await JSZip.loadAsync(file);

    const images = new Map<string, string>();
    const store: {
        meta: ContentMetadata[];
        users: UserProfile[];
        logs: LogItem[];
        graph?: GraphExport;
        project?: ProjectMeta;
        settings?: SomekoneSettings;
    } = {
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
        } else if (data.name === 'metadata.json') {
            promises.push(
                data.async('string').then((r) => {
                    const meta = JSON.parse(r) as ProjectMeta;
                    store.project = meta;
                })
            );
        } else if (data.name === 'settings.json') {
            promises.push(
                data.async('string').then((r) => {
                    store.settings = JSON.parse(r) as SomekoneSettings;
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

    if (store.project) {
        if (store.project.id && store.meta.length > 0) dependencies.add(store.project.id);
        store.project.dependencies.forEach((dep) => {
            if (!dependencies.has(dep)) {
                throw new Error('missing_dependency');
            }
        });
        if (store.project.version > VERSION) {
            throw new Error('bad_version');
        }
    }

    const maxTimestamp = Math.max(
        findLargestLogTimestamp(store.logs),
        store.graph ? findLargestEdgeTimestamp(store.graph.edges) : 0
    );
    const timeOffset = Date.now() - maxTimestamp;

    if (store.graph) {
        // Patch to fix old data
        const topicSet = new Map<TopicNodeId, string>();
        store.graph.nodes.forEach((node) => {
            if (node.type === 'topic') {
                const label = (node.data as TopicData).label;
                topicSet.set(node.id as TopicNodeId, label);
                node.id = getTopicId(label);
            }
        });
        store.graph.edges.forEach((edge) => {
            if (isTopicID(edge.source)) {
                const label = topicSet.get(edge.source) || '';
                edge.source = getTopicId(label);
            }
            if (isTopicID(edge.destination)) {
                const label = topicSet.get(edge.destination) || '';
                edge.destination = getTopicId(label);
            }
        });

        rebaseEdges(store.graph.edges, timeOffset);

        // Remove users who do not have valid names
        const badUsers = new Set<NodeID>(store.graph.nodes.filter((n) => !n.data).map((n) => n.id));

        addNodes(store.graph.nodes.filter((n) => !!n.data));
        addEdges(store.graph.edges.filter((e) => !badUsers.has(e.destination) && !badUsers.has(e.source)));
    }

    store.meta.forEach((v) => {
        addContent(images.get(v.id) || `${STATIC_PATH}/${v.id}.jpg`, v);
    });

    store.users.forEach((u) => {
        try {
            if (u.name !== 'NoName') addUserProfile(u);
        } catch (e) {
            console.warn('User already exists');
        }
    });

    rebaseLog(store.logs, timeOffset);
    store.logs.forEach((l) => {
        appendActionLog(l.log, l.id, !!store.graph);
    });

    return store.settings;
}

const GRAPH_KEY = 'genai_somekone_graph';
const LOG_KEY = 'genai_somekone_logs';

window.addEventListener('beforeunload', () => {
    window.sessionStorage.setItem(GRAPH_KEY, JSON.stringify(dump()));
    const logs = getActionLog(getCurrentUser());
    window.sessionStorage.setItem(LOG_KEY, JSON.stringify(logs));
});

const sessionGraph = window.sessionStorage.getItem(GRAPH_KEY);
if (sessionGraph) {
    const graph = JSON.parse(sessionGraph) as GraphExport;
    addNodes(graph.nodes);
    addEdges(graph.edges);
    console.log('Loaded session graph');
}

const sessionLogs = window.sessionStorage.getItem(LOG_KEY);
if (sessionLogs) {
    const logs = JSON.parse(sessionLogs) as LogEntry[];
    appendActionLog(logs);
}
