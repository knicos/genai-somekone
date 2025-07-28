import { LogEntry, UserNodeId } from '@genai-fi/recom';

export interface LogItem {
    id: UserNodeId;
    log: LogEntry[];
}
