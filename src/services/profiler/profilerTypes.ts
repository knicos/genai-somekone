export type LogActivity =
    | 'like'
    | 'love'
    | 'wow'
    | 'laugh'
    | 'anger'
    | 'sad'
    | 'share_public'
    | 'share_private'
    | 'share_friends'
    | 'hide'
    | 'hide_similar'
    | 'comment'
    | 'dwell'
    | 'follow'
    | 'begin'
    | 'end'
    | 'seen';

export interface LogEntry {
    activity: LogActivity;
    id?: string;
    timestamp: number;
    value?: number;
}
