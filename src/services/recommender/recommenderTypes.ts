import { ContentNodeId, UserNodeId } from '../graph/graphTypes';

type CandidateAlgorithm = 'topic_affinity' | 'similar_user_content' | 'similar_user_topic' | 'coengagement' | 'random';

export interface Recommendation {
    contentId: ContentNodeId;
    candidateOrigin: CandidateAlgorithm;
    topicAffinity?: number;
    similarUser?: UserNodeId;
    coengagementScore?: number;
    engagedItemScore?: number;
    topic?: string;
    engagedItem?: ContentNodeId;
    timestamp: number;
}

export interface ScoredRecommendation extends Recommendation {
    features: number[];
    scores: number[];
    score: number;
    rank: number;
}

export interface CandidateOptions {
    noTaste?: boolean;
    noRandom?: boolean;
    noCoengaged?: boolean;
    allowDuplicates?: boolean;
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
}

export interface RecommendationOptions extends ScoringOptions, CandidateOptions {
    selection?: 'rank' | 'distribution';
}
