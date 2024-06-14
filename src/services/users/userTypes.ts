import { Embedding } from '@genaism/util/embedding';
import { Scores } from '../recommender/recommenderTypes';
import { WeightedLabel } from '../content/contentTypes';
import { ContentNodeId, UserNodeId, WeightedNode } from '../graph/graphTypes';

export interface UserEmbeddings {
    taste: Embedding;
}

export interface TopicAffinities {
    topics: WeightedLabel[];
    seenTopics: WeightedLabel[];
    commentedTopics: WeightedLabel[];
    sharedTopics: WeightedLabel[];
    reactedTopics: WeightedLabel[];
    followedTopics: WeightedLabel[];
    viewedTopics: WeightedLabel[];
}

export interface ContentAffinities {
    contents: WeightedNode<ContentNodeId>[];
}

export interface UserAffinities {
    users: WeightedNode<UserNodeId>[];
}

export interface Affinities {
    topics: TopicAffinities;
    contents: ContentAffinities;
    users: UserAffinities;
}

export interface UserNodeData {
    id: UserNodeId;
    name: string;
    featureWeights: Scores; // This will be deprecated
    embeddings: UserEmbeddings;
    affinities: Affinities;
    image?: ContentNodeId;
    engagement: number;
    lastUpdated: number;
}

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
