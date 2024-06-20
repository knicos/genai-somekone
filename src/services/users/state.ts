import { UserNodeId } from '../graph/graphTypes';
import { LogActivity, LogEntry } from './userTypes';

export interface UserLogEntry {
    entry: LogEntry;
    user: UserNodeId;
}

export const logs = new Map<UserNodeId, LogEntry[]>();
export const logsByType = new Map<LogActivity, UserLogEntry[]>();

export function resetLogs() {
    logs.clear();
    logsByType.clear();
}

export function deleteLogs(id: UserNodeId) {
    logs.delete(id);
    logsByType.forEach((l, k) => {
        logsByType.set(
            k,
            l.filter((v) => v.user !== id)
        );
    });
}
