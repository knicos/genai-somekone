import { UserNodeId } from '../graph/graphTypes';
import { LogEntry } from './userTypes';

export const logs = new Map<UserNodeId, LogEntry[]>();

export function resetLogs() {
    logs.clear();
}

export function deleteLogs(id: UserNodeId) {
    logs.delete(id);
}
