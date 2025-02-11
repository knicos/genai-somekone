import { RecommendationOptions } from '@knicos/genai-recom';

export interface SMConfig {
    hideShareProfile?: boolean;
    hideDataView?: boolean;
    hideProfileView?: boolean;
    hideActionsButton?: boolean;
    hideRecommendationsView?: boolean;
    hidePostContent?: boolean;
    hideOwnProfile?: boolean;
    disableComments?: boolean;
    disableSharing?: boolean;
    disableLiking?: boolean;
    disableFollowing?: boolean;
    disableFeedApp?: boolean;
    recommendations: RecommendationOptions;
    collectResearchData?: boolean;
    automaticUsername?: boolean;
    limitSessions?: boolean;
    showTopicLabels?: boolean;
    alwaysActive?: boolean;
    experimental?: boolean;
    showRecommendationWizard?: boolean;
    showScoringWizard?: boolean;
    showCandidateWizard?: boolean;
    showCandidateRefinementWizard?: boolean;
    showDiversityWizard?: boolean;
    hideRecommendationMenu?: boolean;
    hideCandidateOrigin?: boolean;
    hideExplainedScores?: boolean;
    disablePrinting?: boolean;
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
