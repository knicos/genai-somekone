import { ContentNodeId, UserNodeId, WeightedNode } from '@genaism/services/graph/graphTypes';
import { WeightedLabel } from '../content/contentTypes';
import defaults from './defaultWeights.json';

export type Features = typeof defaults;

export type ReactionType = 'like' | 'love' | 'wow' | 'laugh' | 'anger' | 'sad';

export type LogActivity =
    | ReactionType
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

export function isReaction(act: LogActivity) {
    switch (act) {
        case 'like':
        case 'love':
        case 'wow':
        case 'laugh':
        case 'anger':
        case 'sad':
            return true;
        default:
            return false;
    }
}

export interface LogEntry {
    activity: LogActivity;
    id?: ContentNodeId;
    timestamp: number;
    value?: number;
    content?: string;
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
    featureWeights: number[]; // For recommendation scoring.
    seenItems: number;
    engagementTotal: number;
    positiveRecommendations: number;
    negativeRecommendations: number;
}
