import { UserNodeId } from '../graph/graphTypes';

interface ResearchLogData {
    action: string;
    details: unknown;
    timestamp: number;
    userId: UserNodeId;
}

const log: ResearchLogData[] = [];

export function appendResearchLog(data: ResearchLogData) {
    log.push(data);
}

export function getResearchLog() {
    return log;
}
