import { ContentNodeId, UserNodeId } from '../graph/graphTypes';

type CandidateAlgorithm = 'topic_affinity' | 'similar_user' | 'coengagement' | 'random' | 'popular';

export interface Recommendation {
    contentId: ContentNodeId;
    candidateOrigin: CandidateAlgorithm;
    topicAffinity?: number;
    similarUser?: UserNodeId;
    coengagementScore?: number;
    engagedItemScore?: number;
    userSimilarityScore?: number;
    popularityScore?: number;
    topic?: string;
    engagedItem?: ContentNodeId;
    timestamp: number;
    probability?: number;
    candidateProbability?: number;
}

export interface Scores {
    taste?: number; // Label overlap
    viewing?: number; // Viewing embedding
    reaction?: number; // Reaction embedding
    following?: number; // Follow embedding
    coengagement?: number; // Number of common co-engagements
    commenting?: number; // Comment embedding
    sharing?: number; // Sharing embedding
    lastSeen?: number; // Time since last seen
    embedding?: number; // Similarity to engagement embedding
    engagement?: number; // An engagement model output
    trending?: number; // Overall trending score of content
    popularity?: number; // Total popularity (relative)
    quality?: number; // Assessed image quality score
    random?: number; // Some random component
}

export interface ScoredRecommendation extends Recommendation {
    features: Scores;
    scores: Scores;
    significance: Scores;
    score: number;
    rank: number;
    diversity: number;
}

export interface CandidateOptions {
    taste: number;
    random: number;
    coengaged: number;
    allowDuplicates?: boolean;
    similarUsers: number;
    popular: number;
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
    noPopularity?: boolean;
    excludeSignificance?: boolean;
    selection?: 'rank' | 'distribution';
}

export type RecommendationOptions = ScoringOptions & CandidateOptions;
