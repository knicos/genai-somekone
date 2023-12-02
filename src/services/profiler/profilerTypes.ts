import { WeightedNode } from '@genaism/services/graph/graphTypes';
import { WeightedLabel } from '../content/contentTypes';

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
    | 'seen'
    | 'inactive'
    | 'engagement';

export interface LogEntry {
    activity: LogActivity;
    id?: string;
    timestamp: number;
    value?: number;
}

export interface ProfileSummary {
    taste: WeightedLabel[];
    engagedContent: WeightedNode[];
    seenTopics: WeightedNode[];
    commentedTopics: WeightedNode[];
    sharedTopics: WeightedNode[];
    reactedTopics: WeightedNode[];
    followedTopics: WeightedNode[];
    viewedTopics: WeightedNode[];
}

export interface UserProfile extends ProfileSummary {
    id: string;
    name: string;
    engagement: number;
    attributes: Record<string, unknown>;
}
