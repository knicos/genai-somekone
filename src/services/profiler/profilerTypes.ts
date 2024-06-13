import { ContentNodeId, UserNodeId, WeightedNode } from '@genaism/services/graph/graphTypes';
import { WeightedLabel } from '../content/contentTypes';
import defaults from './defaultWeights.json';
import { Scores } from '../recommender/recommenderTypes';

export type Features = typeof defaults;

export type ReactionType = 'like' | 'unreact';

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
    | 'unfollow'
    | 'begin'
    | 'end'
    | 'seen'
    | 'inactive'
    | 'engagement';

export function isReaction(act: LogActivity) {
    switch (act) {
        case 'like':
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
    topics: WeightedLabel[];
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
    featureWeights: Scores; // For recommendation scoring.
    seenItems: number;
    engagementTotal: number;
    positiveRecommendations: number;
    negativeRecommendations: number;
    embedding: number[];
    image?: ContentNodeId;
}
