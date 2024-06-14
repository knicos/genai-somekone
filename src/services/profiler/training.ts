import { UserNodeId } from '../graph/graphTypes';
import { ScoredRecommendation, Scores } from '../recommender/recommenderTypes';
import { InternalUserProfile } from './profilerTypes';
import { internalProfiles } from './state';

const MAX_LEARNING_RATE = 0.3;
const MIN_LEARNING_RATE = 0;

export function trainProfile(input: ScoredRecommendation, profile: InternalUserProfile, score: number) {
    profile.seenItems++;
    profile.engagementTotal += score;

    const threshold = profile.engagementTotal / profile.seenItems;
    const error = score - threshold;

    if (error > 0) {
        profile.positiveRecommendations++;
    } else {
        profile.negativeRecommendations++;
    }

    // Bias the learning rate by proportion of positive or negative samples
    const learningRate =
        (1.0 -
            (error > 0
                ? profile.positiveRecommendations / profile.seenItems
                : profile.negativeRecommendations / profile.seenItems)) *
            MAX_LEARNING_RATE +
        MIN_LEARNING_RATE;

    //console.log('TRAIN', profile, input, error * learningRate);

    const keys = Array.from(Object.keys(profile.profile.featureWeights)) as (keyof Scores)[];
    keys.forEach((k) => {
        const w = profile.profile.featureWeights[k] || 1;
        profile.profile.featureWeights[k] = w + error * learningRate * (input.features[k] || 0);
    });
}

export function trainProfileById(id: UserNodeId, input: ScoredRecommendation, score: number) {
    const profile = internalProfiles.get(id);
    if (profile) {
        trainProfile(input, profile, score);
    }
}
