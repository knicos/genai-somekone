import { UserNodeId } from '../graph/graphTypes';
import { LogEntry } from '../profiler/profilerTypes';

export interface LogItem {
    id: UserNodeId;
    log: LogEntry[];
}
