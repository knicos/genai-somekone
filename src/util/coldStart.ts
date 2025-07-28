import { RecommendationOptions, Scores } from '@genai-fi/recom';

const FINAL_SCORE_WEIGHTS: Required<Scores> = {
    taste: 2,
    coengagement: 1,
    viewing: 1.2,
    sharing: 1,
    commenting: 1.2,
    popularity: 1,
    following: 1.2,
    reaction: 1,
    lastSeen: 3,
    lastEngaged: 5,
    random: 0,
    embedding: 0,
    trending: 0,
    engagement: 0,
    quality: 0,
};

const INIT_SCORE_WEIGHTS: Required<Scores> = {
    taste: 0,
    coengagement: 0,
    viewing: 0,
    sharing: 0,
    commenting: 0,
    popularity: 0.2,
    following: 0,
    reaction: 0,
    lastSeen: 3,
    lastEngaged: 5,
    random: 0,
    embedding: 0,
    trending: 0,
    engagement: 0,
    quality: 0,
};

export default function coldStarter(startWeight: number, options: RecommendationOptions): RecommendationOptions {
    if (startWeight === 0) return options;

    const w = startWeight;
    const iw = 1 - w;
    const opt: RecommendationOptions = {
        ...options,
        weights: {
            taste: w * INIT_SCORE_WEIGHTS.taste + iw * (options.weights?.taste || FINAL_SCORE_WEIGHTS.taste),
            coengagement:
                w * INIT_SCORE_WEIGHTS.coengagement +
                iw * (options.weights?.coengagement || FINAL_SCORE_WEIGHTS.coengagement),
            viewing: w * INIT_SCORE_WEIGHTS.viewing + iw * (options.weights?.viewing || FINAL_SCORE_WEIGHTS.viewing),
            sharing: w * INIT_SCORE_WEIGHTS.sharing + iw * (options.weights?.sharing || FINAL_SCORE_WEIGHTS.sharing),
            commenting:
                w * INIT_SCORE_WEIGHTS.commenting +
                iw * (options.weights?.commenting || FINAL_SCORE_WEIGHTS.commenting),
            popularity:
                w * INIT_SCORE_WEIGHTS.popularity +
                iw * (options.weights?.popularity || FINAL_SCORE_WEIGHTS.popularity),
            following:
                w * INIT_SCORE_WEIGHTS.following + iw * (options.weights?.following || FINAL_SCORE_WEIGHTS.following),
            reaction:
                w * INIT_SCORE_WEIGHTS.reaction + iw * (options.weights?.reaction || FINAL_SCORE_WEIGHTS.reaction),
            lastSeen:
                w * INIT_SCORE_WEIGHTS.lastSeen + iw * (options.weights?.lastSeen || FINAL_SCORE_WEIGHTS.lastSeen),
            lastEngaged:
                w * INIT_SCORE_WEIGHTS.lastEngaged +
                iw * (options.weights?.lastEngaged || FINAL_SCORE_WEIGHTS.lastEngaged),
            random: w * INIT_SCORE_WEIGHTS.random + iw * (options.weights?.random || FINAL_SCORE_WEIGHTS.random),
        },
    };

    return opt;
}
