import { RecommendationOptions } from '@genaism/services/recommender/recommenderTypes';

export interface SMConfig {
    hideShareProfile?: boolean;
    hideDataView?: boolean;
    hideProfileView?: boolean;
    hideActionsButton?: boolean;
    hideRecommendationsView?: boolean;
    disableFeedApp?: boolean;
    recommendations: RecommendationOptions;
    collectResearchData?: boolean;
    showTopicLabels?: boolean;
}
