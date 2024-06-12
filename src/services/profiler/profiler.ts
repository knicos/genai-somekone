import { ProfileSummary, UserProfile } from '../profiler/profilerTypes';
import {
    addNode,
    addNodeIfNotExists,
    getNodesByType,
    getEdgeWeights,
    addEdge,
    hasNode,
    getNodeData,
    updateNode,
} from '@genaism/services/graph/graph';
import { getTopicId } from '@genaism/services/concept/concept';
import { addEdgeTypeListener, addNodeTypeListener } from '../graph/events';
import { emitProfileEvent } from '../profiler/events';
import { ContentNodeId, UserNodeId, isContentID, isUserID } from '../graph/graphTypes';
import defaults from './defaultWeights.json';
import { ScoredRecommendation, Scores } from '../recommender/recommenderTypes';
import { trainProfile } from './training';
import { getCurrentUser, outOfDate, users, resetProfiles } from './state';
import { appendActionLog, addLogEntry, getActionLog, getActionLogSince } from './logs';
import { anonUsername } from '@genaism/util/anon';
import { generateEmbedding } from './userEmbedding';
import { createProfileSummaryById } from './summary';

export { appendActionLog, addLogEntry, getCurrentUser, resetProfiles, getActionLog, getActionLogSince };

const defaultWeights = Array.from(Object.values(defaults));
const weightKeys = Array.from(Object.keys(defaults));
export { defaultWeights, weightKeys };

const PROFILE_COUNTS = 10;

const globalScore = {
    engagement: 0,
};

function triggerProfileEvent(id: UserNodeId) {
    const wasOOD = outOfDate.has(id);
    outOfDate.add(id);
    if (!wasOOD) emitProfileEvent(id);
}

addEdgeTypeListener('engaged', (id: UserNodeId) => {
    if (users.has(id)) {
        triggerProfileEvent(id);
    }
});
addEdgeTypeListener('topic', (id: UserNodeId) => {
    if (users.has(id)) {
        triggerProfileEvent(id);
    }
});

interface UserData {
    name: string;
    featureWeights: Scores;
}

addNodeTypeListener('user', (id: UserNodeId) => {
    const data = getNodeData<UserData>(id);
    if (data) {
        const profile: UserProfile = {
            id: id,
            name: data.name,
            engagement: -1,
            attributes: {},
            topics: [],
            engagedContent: [],
            reactedTopics: [],
            commentedTopics: [],
            seenTopics: [],
            sharedTopics: [],
            viewedTopics: [],
            followedTopics: [],
            featureWeights: data?.featureWeights || { ...defaults },
            seenItems: 0,
            engagementTotal: 0,
            positiveRecommendations: 0,
            negativeRecommendations: 0,
            embedding: [],
        };
        users.set(id, profile);
        outOfDate.add(id);
        emitProfileEvent(id);
    }
});

export function getUserName(id: UserNodeId): string {
    const d = getNodeData<UserData>(id);
    return d ? d.name : '';
}

export function setUserName(id: UserNodeId, name: string) {
    if (!hasNode(id)) {
        addNode('user', id, {
            name: name,
            featureWeights: [...defaultWeights],
        });
    } else {
        updateNode(id, {
            name,
            featureWeights: [...defaultWeights],
        });
    }
}

export function clearProfile(id: UserNodeId) {
    outOfDate.add(id);
    emitProfileEvent(id);
}

/** Used when initially creating a profile or loading from saved file. */
export function addUserProfile(profile: UserProfile) {
    const uid = isUserID(profile.id) ? profile.id : (`user:${profile.id}` as UserNodeId);
    const hadNode = hasNode(uid);

    if (!hadNode) {
        users.delete(uid);
    } else {
        if (users.has(uid)) {
            throw new Error('user_exists');
        }
    }

    addNodeIfNotExists('user', uid, {
        name: profile.name,
        featureWeights: profile.featureWeights || [...defaultWeights],
    });

    if (!hadNode) {
        updateProfile(uid, profile);
    }
}

/** Updates a profile manually rather than re-generating it. For example,
 *  another computer may have done the calculations to generate the profile and this
 *  is just a manual replacement on other machines.
 */
export function updateProfile(id: UserNodeId, profile: UserProfile | ProfileSummary) {
    outOfDate.add(id);

    addNodeIfNotExists('user', id);

    // Update node data
    if ('featureWeights' in profile && profile.featureWeights) {
        const data = getNodeData<UserData>(id);
        if (data) {
            data.featureWeights = { ...profile.featureWeights };
        }
    }

    profile.engagedContent.forEach((c) => {
        const cid = isContentID(c.id) ? c.id : (`content:${c.id}` as ContentNodeId);
        addEdge('engaged', id, cid, c.weight);
        addEdge('engaged', cid, id, c.weight);
    });
    profile.topics.forEach((t) => {
        addEdge('topic', id, getTopicId(t.label), t.weight);
        addEdge('topic', getTopicId(t.label), id, t.weight);
    });

    if ('engagement' in profile) {
        globalScore.engagement = Math.max(globalScore.engagement, profile.engagement);
    }

    emitProfileEvent(id);
}

export function replaceProfile(id: UserNodeId, profile: ProfileSummary) {
    const user = users.get(id) || createUserProfile(id, 'NoName');
    users.set(id, { ...user, ...profile });
    outOfDate.delete(id);
    emitProfileEvent(id);
}

export function createEmptyProfile(id: UserNodeId, name: string): UserProfile {
    return {
        id: id,
        name: name,
        engagement: -1,
        attributes: {},
        topics: [],
        engagedContent: [],
        reactedTopics: [],
        commentedTopics: [],
        seenTopics: [],
        sharedTopics: [],
        viewedTopics: [],
        followedTopics: [],
        featureWeights: { ...defaults },
        seenItems: 0,
        engagementTotal: 0,
        positiveRecommendations: 0,
        negativeRecommendations: 0,
        embedding: [],
    };
}

export function createUserProfile(id: UserNodeId, name: string): UserProfile {
    const profile: UserProfile = createEmptyProfile(id, name);
    addUserProfile(profile);
    return profile;
}

export function getUserProfile(id?: UserNodeId): UserProfile {
    const aid = id || getCurrentUser();
    const profile = users.get(aid);

    if (profile && !outOfDate.has(aid)) return profile;

    const newProfile = recreateUserProfile(aid);
    users.set(aid, newProfile);
    outOfDate.delete(aid);
    return newProfile;
}

/** When a profile is flagged as out-of-date, rebuild the summary and embeddings. */
export function recreateUserProfile(id?: UserNodeId): UserProfile {
    const aid = id || getCurrentUser();
    const summary = createProfileSummaryById(aid, PROFILE_COUNTS);
    const state = users.get(aid);

    // const seenItems = getRelated('seen', aid, { period: TIME_WINDOW });

    // Update the embedding
    const embedding = generateEmbedding(aid);

    // Attempt to find data
    const data = getNodeData<UserData>(aid);
    if (data && !data?.featureWeights) data.featureWeights = { ...defaults };

    const newProfile = {
        ...summary,
        name: state?.name || data?.name || 'NoName',
        id: aid,
        engagement: summary.engagedContent.reduce((s, v) => s + v.weight, 0),
        attributes: {},
        featureWeights: data?.featureWeights || { ...defaults },
        seenItems: state?.seenItems || 0,
        engagementTotal: state?.engagementTotal || 0,
        positiveRecommendations: state?.positiveRecommendations || 0,
        negativeRecommendations: state?.negativeRecommendations || 0,
        embedding,
    };

    globalScore.engagement = Math.max(globalScore.engagement, newProfile.engagement);

    return newProfile;
}

export function getAllUsers(): string[] {
    return getNodesByType('user');
}

export function updateEngagement(recommendation: ScoredRecommendation) {
    const weight = getEdgeWeights('last_engaged', getCurrentUser(), recommendation.contentId)[0] || 0;
    appendActionLog([{ activity: 'engagement', id: recommendation.contentId, value: weight, timestamp: Date.now() }]);

    const profile = users.get(getCurrentUser());
    if (profile) {
        trainProfile(recommendation, profile, weight);
    }
}

export function getBestEngagement() {
    return globalScore.engagement;
}

export function setBestEngagement(e: number) {
    globalScore.engagement = Math.max(globalScore.engagement, e);
}

export function anonProfiles() {
    users.forEach((user) => {
        user.name = anonUsername();
        const data = getNodeData<UserData>(user.id);
        if (data) {
            data.name = user.name;
        }
    });
}
