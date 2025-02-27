import { RecommendationOptions } from '@knicos/genai-recom';

interface FeedConfig {
    disableComments?: boolean;
    disableSharing?: boolean;
    disableLiking?: boolean;
    disableFollowing?: boolean;
    showTopicLabels?: boolean;
    alwaysActive?: boolean;
}

interface ViewConfig {
    hideShareProfile?: boolean;
    hideDataView?: boolean;
    hideProfileView?: boolean;
    hideActionsButton?: boolean;
    hideRecommendationsView?: boolean;
    hidePostContent?: boolean;
    hideOwnProfile?: boolean;
}

interface RecommendationConfig {
    showRecommendationWizard?: boolean;
    showScoringWizard?: boolean;
    showCandidateWizard?: boolean;
    showCandidateRefinementWizard?: boolean;
    showDiversityWizard?: boolean;
    hideRecommendationMenu?: boolean;
    hideCandidateOrigin?: boolean;
    hideExplainedScores?: boolean;
    recommendations: RecommendationOptions;
}

interface WorkflowConfig {
    blackboxWorkflow?: boolean;
    hideFeedInWorkflow?: boolean;
}

export interface SMConfig extends RecommendationConfig, ViewConfig, FeedConfig, WorkflowConfig {
    disableFeedApp?: boolean;
    collectResearchData?: boolean;
    automaticUsername?: boolean;
    limitSessions?: boolean;
    experimental?: boolean;
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
