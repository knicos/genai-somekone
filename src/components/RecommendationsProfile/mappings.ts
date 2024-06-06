import { RecommendationOptions } from '@genaism/services/recommender/recommenderTypes';

export function isPersonalised(options: RecommendationOptions): boolean {
    return options.taste > 0 || options.coengaged > 0 || options.similarUsers > 0;
}

export function isNonPersonalised(options: RecommendationOptions): boolean {
    return options.random > 0;
}

export function isOnlyPersonalised(options: RecommendationOptions): boolean {
    return !isNonPersonalised(options) && isPersonalised(options);
}

export function isOnlyNonPersonalised(options: RecommendationOptions): boolean {
    return isNonPersonalised(options) && !isPersonalised(options);
}

export function mapPersonalisation(options: RecommendationOptions): 'both' | 'personal' | 'nonpersonal' {
    if (isOnlyPersonalised(options)) return 'personal';
    if (isOnlyNonPersonalised(options)) return 'nonpersonal';
    return 'both';
}

export function isPredictedEngagement(options: RecommendationOptions) {
    return (
        !options.noTasteScore ||
        !options.noCoengagementScore ||
        !options.noSharingScore ||
        !options.noCommentingScore ||
        !options.noFollowingScore ||
        !options.noViewingScore ||
        !options.noReactionScore
    );
}

export function mapScoring(options: RecommendationOptions): 'all' | 'profile' | 'noprofile' | 'random' {
    if (isPredictedEngagement(options)) return 'profile';
    return 'random';
}
