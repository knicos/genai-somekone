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
    alwaysActive?: boolean;
}

export function mergeConfiguration(a: SMConfig, b: Partial<SMConfig>): SMConfig {
    return {
        ...a,
        ...b,
        recommendations: {
            ...a.recommendations,
            ...b.recommendations,
        },
    };
}
