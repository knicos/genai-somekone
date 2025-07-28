import { compress, decompress } from 'lz-string';
import { LogItem } from './loaderTypes';
import { ActionLogService, GNode, GraphService, NodeType } from '@genai-fi/recom';

const GRAPH_KEY = 'genai_somekone_graph';
const LOG_KEY = 'genai_somekone_logs';

let addedHandler = false;
const saverState = {
    save: true,
};

export function cancelSessionSave() {
    saverState.save = false;
}

export function loadSession(graphSvc: GraphService, logger: ActionLogService) {
    const sessionGraph = window.sessionStorage.getItem(GRAPH_KEY);
    window.sessionStorage.removeItem(GRAPH_KEY);
    const sessionLogs = window.sessionStorage.getItem(LOG_KEY);
    window.sessionStorage.removeItem(LOG_KEY);

    if (sessionGraph) {
        const graph = JSON.parse(decompress(sessionGraph)) as GNode<NodeType>[];
        graphSvc.addNodes(graph);
    }

    if (sessionLogs) {
        const logs = JSON.parse(decompress(sessionLogs)) as LogItem[];

        //const ts = findLargestLogTimestamp(logs);
        //const timeOffset = Date.now() - ts;
        //rebaseLog(logs, timeOffset);
        logs.forEach((log) => {
            logger.appendActionLog(log.log, log.id);
        });
        //logger.sortLogs();
    }

    if (!addedHandler) {
        window.addEventListener('beforeunload', () => {
            if (saverState.save) {
                try {
                    window.sessionStorage.setItem(GRAPH_KEY, compress(JSON.stringify(graphSvc.dumpNodes())));
                    const users = graphSvc.getNodesByType('user');
                    const logs = users.map((u) => ({ id: u, log: logger.getActionLog(u) }));
                    window.sessionStorage.setItem(LOG_KEY, compress(JSON.stringify(logs)));
                } catch (e) {
                    console.log('Save error', e);
                }
            }
        });
        addedHandler = true;
    }
}
