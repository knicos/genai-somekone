import {
    addNode,
    addNodeIfNotExists,
    getNodesByType,
    getEdgeWeights,
    addEdge,
    hasNode,
    updateNode,
    touchNode,
} from '@genaism/services/graph/graph';
import { getTopicId } from '@genaism/services/concept/concept';
import { addEdgeTypeListener, addNodeTypeListener } from '../graph/events';
import { emitProfileEvent } from '../profiler/events';
import { ContentNodeId, UserNodeId, isContentID } from '../graph/graphTypes';
import defaults from './defaultWeights.json';
import { ScoredRecommendation } from '../recommender/recommenderTypes';
import { trainProfile } from './training';
import { getCurrentUser, outOfDate, internalProfiles, resetProfiles } from './state';
import { appendActionLog, addLogEntry, getActionLog, getActionLogSince } from '../users/logs';
import { anonUsername } from '@genaism/util/anon';
import { getUserData } from '../users/users';
import { UserNodeData } from '../users/userTypes';
import { buildUserProfile } from './builder';
import { InternalUserProfile } from './profilerTypes';

export { appendActionLog, addLogEntry, getCurrentUser, resetProfiles, getActionLog, getActionLogSince };

const defaultWeights = Array.from(Object.values(defaults));
const weightKeys = Array.from(Object.keys(defaults));
export { defaultWeights, weightKeys };

const globalScore = {
    engagement: 0,
};

function triggerProfileEvent(id: UserNodeId) {
    const wasOOD = outOfDate.has(id);
    outOfDate.add(id);
    if (!wasOOD) emitProfileEvent(id);
}

addEdgeTypeListener('engaged', (id: UserNodeId) => {
    if (internalProfiles.has(id)) {
        triggerProfileEvent(id);
    }
});
addEdgeTypeListener('topic', (id: UserNodeId) => {
    if (internalProfiles.has(id)) {
        triggerProfileEvent(id);
    }
});

addNodeTypeListener('user', (id: UserNodeId) => {
    const data = getUserData(id);
    if (data) {
        // Validate the data structure
        if (!data.embeddings) {
            const newData = { ...createEmptyProfile(id, 'NoName'), ...data };
            outOfDate.add(id);
            updateNode(id, newData);
            return;
        }

        const hadProfile = internalProfiles.has(id);
        const oldProfile = internalProfiles.get(id) || {
            id,
            positiveRecommendations: 0,
            negativeRecommendations: 0,
            profile: data,
            seenItems: 0,
            engagementTotal: 0,
        };
        const oldData = oldProfile.profile;
        oldProfile.profile = data;
        internalProfiles.set(id, oldProfile);

        if (oldData !== data || !hadProfile) {
            // Emit event, but it is not out-of-date.
            emitProfileEvent(id);
        }
    } else {
        const newProfile = createEmptyProfile(id, 'NoName');
        outOfDate.add(id);
        updateNode(id, newProfile);
    }
});

export function getUserName(id: UserNodeId): string {
    const d = getUserData(id);
    return d ? d.name : '';
}

export function setUserName(id: UserNodeId, name: string) {
    if (!hasNode(id)) {
        addNode('user', id, createEmptyProfile(id, name));
    } else {
        const data = getUserData(id);
        if (data) {
            data.name = name;
        } else {
            updateNode(id, createEmptyProfile(id, name));
        }
    }
}

export function touchProfile(id: UserNodeId) {
    emitProfileEvent(id);
}

export function clearProfile(id: UserNodeId) {
    outOfDate.add(id);
    emitProfileEvent(id);
}

/** Used when initially creating a profile or loading from saved file. */
export function addUserProfile(id: UserNodeId, profile: UserNodeData) {
    const hadNode = hasNode(id);

    if (hadNode) {
        if (internalProfiles.has(id)) {
            throw new Error('user_exists');
        }
    }

    addNodeIfNotExists('user', id, profile);

    if (!hadNode) {
        // Ensure all the graph edges are also added.
        reverseProfile(id, profile);
    }
}

/** Updates a profile manually rather than re-generating it. For example,
 *  another computer may have done the calculations to generate the profile and this
 *  is just a manual replacement on other machines.
 */
export function reverseProfile(id: UserNodeId, profile: UserNodeData) {
    outOfDate.add(id);

    addNodeIfNotExists('user', id, profile);

    profile.affinities.contents.contents.forEach((c) => {
        const cid = isContentID(c.id) ? c.id : (`content:${c.id}` as ContentNodeId);
        addEdge('engaged', id, cid, c.weight);
        addEdge('engaged', cid, id, c.weight);
    });
    profile.affinities.topics.topics.forEach((t) => {
        addEdge('topic', id, getTopicId(t.label), t.weight);
        addEdge('topic', getTopicId(t.label), id, t.weight);
    });

    if ('engagement' in profile) {
        globalScore.engagement = Math.max(globalScore.engagement, profile.engagement);
    }

    outOfDate.delete(id);
    updateNode(id, profile);

    //emitProfileEvent(id);
}

export function replaceProfile(id: UserNodeId, profile: UserNodeData) {
    const user: InternalUserProfile = internalProfiles.get(id) || {
        profile,
        id,
        positiveRecommendations: 0,
        negativeRecommendations: 0,
        seenItems: 0,
        engagementTotal: 0,
    };
    user.profile = profile;
    internalProfiles.set(id, user);
    outOfDate.delete(id);
    emitProfileEvent(id);
}

export function createEmptyProfile(id: UserNodeId, name: string): UserNodeData {
    return {
        id,
        name: name,
        engagement: -1,
        affinities: {
            topics: {
                topics: [],
                seenTopics: [],
                viewedTopics: [],
                commentedTopics: [],
                sharedTopics: [],
                reactedTopics: [],
                followedTopics: [],
            },
            contents: {
                contents: [],
            },
            users: {
                users: [],
            },
        },
        featureWeights: { ...defaults },
        embeddings: {
            taste: new Array(20).fill(0),
        },
        lastUpdated: Date.now(),
    };
}

export function createUserProfile(id: UserNodeId, name: string): UserNodeData {
    const profile = createEmptyProfile(id, name);
    addUserProfile(id, profile);
    return profile;
}

export function getUserProfile(id?: UserNodeId): UserNodeData {
    const aid = id || getCurrentUser();
    const profile = internalProfiles.get(aid);

    if (profile && !outOfDate.has(aid)) return profile.profile;

    if (!profile) {
        updateNode(aid, createEmptyProfile(aid, 'NoName'));
    }

    const newProfile = buildUserProfile(aid);
    touchNode(aid);
    outOfDate.delete(aid);
    return newProfile;
}

export function getAllUsers(): string[] {
    return getNodesByType('user');
}

export function updateEngagement(recommendation: ScoredRecommendation) {
    const weight = getEdgeWeights('last_engaged', getCurrentUser(), recommendation.contentId)[0] || 0;
    appendActionLog([{ activity: 'engagement', id: recommendation.contentId, value: weight, timestamp: Date.now() }]);

    const profile = internalProfiles.get(getCurrentUser());
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
    internalProfiles.forEach((user) => {
        user.profile.name = anonUsername();
    });
}
