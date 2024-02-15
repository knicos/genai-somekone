import { UserNodeId } from '../graph/graphTypes';

interface ResearchLogData {
    action: string;
    details: unknown;
    timestamp: number;
    userId: UserNodeId;
}

let log: ResearchLogData[] = [];

export function appendResearchLog(data: ResearchLogData) {
    log.push(data);
}

export function getResearchLog() {
    return log;
}

export function removeResearchData(id: UserNodeId) {
    log = log.filter((l) => l.userId !== id);
}

export function clearResearchData() {
    log = [];
}
