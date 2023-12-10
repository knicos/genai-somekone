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
    tasteSimilarityScore: number; //< Distance of content labels from taste profile
    contentTrendingScore: number; //< Recent engagements with this content item
    topicTrendingScore: number; //< Recent engagements with the topics
    coengagementScore: number; //< Strength of co-engagement with recently engaged items
    userSimilarityScore: number; //< Similarity of users who engaged recently with this content.
    randomnessScore: number; //< Depending on a heat setting, add a random component sometimes.
    seenFactor: number; //< Reduce scores if content has been seen recently.
    score: number;
    rank: number;
}
