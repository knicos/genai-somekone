import { LogEntry, UserNodeId } from '@knicos/genai-recom';

export interface LogItem {
    id: UserNodeId;
    log: LogEntry[];
}
