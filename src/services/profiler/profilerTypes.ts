import { UserNodeId } from '@genaism/services/graph/graphTypes';
import defaults from './defaultWeights.json';
import { UserNodeData } from '../users/userTypes';

export type Features = typeof defaults;

export interface InternalUserProfile {
    id: UserNodeId;
    profile: UserNodeData;
    positiveRecommendations: number;
    negativeRecommendations: number;
    seenItems: number;
    engagementTotal: number;
}
