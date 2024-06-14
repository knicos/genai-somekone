import { getSimilarContent } from '../content/content';
import { UserNodeId } from '../graph/graphTypes';
import { Affinities, UserNodeData } from '../users/userTypes';
import { getUserData } from '../users/users';
import { getContentAffinities, getTopicAffinities, getUserAffinities } from './affinities';
import { getCurrentUser } from './state';
import { generateEmbedding } from './userEmbedding';

const PROFILE_COUNTS = 10;

/** When a profile is flagged as out-of-date, rebuild the summary and embeddings. */
export function buildUserProfile(id?: UserNodeId): UserNodeData {
    const aid = id || getCurrentUser();
    const affinities: Affinities = {
        topics: getTopicAffinities(aid, PROFILE_COUNTS),
        contents: getContentAffinities(aid, PROFILE_COUNTS),
        users: getUserAffinities(),
    };

    // const seenItems = getRelated('seen', aid, { period: TIME_WINDOW });

    // Update the embedding
    const embedding = generateEmbedding(aid);

    const image = getSimilarContent(
        embedding,
        1,
        affinities.contents.contents.map((e) => e.id)
    )[0]?.id;

    // Attempt to find data
    const data = getUserData(aid);

    if (!data) {
        console.error('No data for', aid);
        throw new Error('no_profile_data');
    }

    data.affinities = affinities;
    data.embeddings.taste = embedding;
    data.image = image;
    data.engagement = affinities.contents.contents.reduce((s, v) => s + v.weight, 0);
    data.lastUpdated = Date.now();

    // globalScore.engagement = Math.max(globalScore.engagement, newProfile.engagement);

    return data;
}
