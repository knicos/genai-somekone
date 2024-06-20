import { compress, decompress } from 'lz-string';
import { addNodes, getNodesByType } from '../graph/nodes';
import { GNode, NodeType } from '../graph/graphTypes';
import { LogItem } from './loaderTypes';
import { findLargestLogTimestamp, rebaseLog } from './rebase';
import { appendActionLog, getActionLog, sortLogs } from '../users/logs';
import { dumpNodes } from '../graph/state';

const GRAPH_KEY = 'genai_somekone_graph';
const LOG_KEY = 'genai_somekone_logs';

window.addEventListener('beforeunload', () => {
    try {
        window.sessionStorage.setItem(GRAPH_KEY, compress(JSON.stringify(dumpNodes())));
        const users = getNodesByType('user');
        const logs = users.map((u) => ({ id: u, log: getActionLog(u) }));
        window.sessionStorage.setItem(LOG_KEY, compress(JSON.stringify(logs)));
    } catch (e) {
        console.log('Save error', e);
    }
});

export function loadSession() {
    const sessionGraph = window.sessionStorage.getItem(GRAPH_KEY);
    window.sessionStorage.removeItem(GRAPH_KEY);
    const sessionLogs = window.sessionStorage.getItem(LOG_KEY);
    window.sessionStorage.removeItem(LOG_KEY);

    if (sessionGraph) {
        const graph = JSON.parse(decompress(sessionGraph)) as GNode<NodeType>[];
        addNodes(graph);
        console.log('Loaded session graph');
    }

    if (sessionLogs) {
        const logs = JSON.parse(decompress(sessionLogs)) as LogItem[];
        const ts = findLargestLogTimestamp(logs);
        const timeOffset = Date.now() - ts;
        rebaseLog(logs, timeOffset);
        logs.forEach((log) => {
            appendActionLog(log.log, log.id);
        });
        sortLogs();
    }
}
