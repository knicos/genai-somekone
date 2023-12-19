import { RecommendationOptions } from '@genaism/services/recommender/recommenderTypes';

export interface SMConfig {
    hideShareProfile?: boolean;
    topicCandidates?: boolean;
    similarUserCandidates?: boolean;
    recommendations?: RecommendationOptions;
}
