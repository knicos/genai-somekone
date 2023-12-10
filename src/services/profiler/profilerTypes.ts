import { ContentNodeId, UserNodeId, WeightedNode } from '@genaism/services/graph/graphTypes';
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
    id?: ContentNodeId;
    timestamp: number;
    value?: number;
}

export interface ProfileSummary {
    taste: WeightedLabel[];
    engagedContent: WeightedNode<ContentNodeId>[];
    seenTopics: WeightedLabel[];
    commentedTopics: WeightedLabel[];
    sharedTopics: WeightedLabel[];
    reactedTopics: WeightedLabel[];
    followedTopics: WeightedLabel[];
    viewedTopics: WeightedLabel[];
}

export interface UserProfile extends ProfileSummary {
    id: UserNodeId;
    name: string;
    engagement: number;
    attributes: Record<string, unknown>;
}
