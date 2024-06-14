import { UserNodeId } from '../graph/graphTypes';
import { LogEntry } from '../users/userTypes';

export interface LogItem {
    id: UserNodeId;
    log: LogEntry[];
}
