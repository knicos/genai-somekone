import { ContentNodeId, UserNodeId } from '../graph/graphTypes';

type CandidateAlgorithm = 'topic_affinity' | 'similar_user' | 'coengagement' | 'random';

export interface Recommendation {
    contentId: ContentNodeId;
    candidateOrigin: CandidateAlgorithm;
    topicAffinity?: number;
    similarUser?: UserNodeId;
    coengagementScore?: number;
    engagedItemScore?: number;
    userSimilarityScore?: number;
    topic?: string;
    engagedItem?: ContentNodeId;
    timestamp: number;
}

export interface ScoredRecommendation extends Recommendation {
    features: number[];
    scores: number[];
    significance?: number[];
    score: number;
    rank: number;
    rankScore: number;
}

export interface CandidateOptions {
    taste: number;
    random: number;
    coengaged: number;
    allowDuplicates?: boolean;
    similarUsers: number;
}

export interface ScoringOptions {
    noTasteScore?: boolean;
    noLastSeenScore?: boolean;
    noSharingScore?: boolean;
    noFollowingScore?: boolean;
    noReactionScore?: boolean;
    noViewingScore?: boolean;
    noCoengagementScore?: boolean;
    noCommentingScore?: boolean;
    excludeSignificance?: boolean;
}

export interface RecommendationOptions extends ScoringOptions, CandidateOptions {
    selection?: 'rank' | 'distribution';
}
