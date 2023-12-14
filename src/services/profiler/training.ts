import { ScoredRecommendation } from '../recommender/recommenderTypes';
import { UserProfile } from './profilerTypes';

const MAX_LEARNING_RATE = 0.1;

export function trainProfile(input: ScoredRecommendation, profile: UserProfile, score: number) {
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
        MAX_LEARNING_RATE;

    profile.featureWeights.forEach((w, ix) => {
        profile.featureWeights[ix] = w + error * learningRate * input.features[ix];
    });
}
