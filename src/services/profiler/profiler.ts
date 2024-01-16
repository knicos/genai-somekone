import { ProfileSummary, UserProfile } from '../profiler/profilerTypes';
import {
    addNode,
    addNodeIfNotExists,
    getNodesByType,
    getRelated,
    getEdgeWeights,
    addEdge,
    hasNode,
    getNodeData,
    updateNode,
} from '@genaism/services/graph/graph';
import { getTopicId, getTopicLabel } from '@genaism/services/concept/concept';
import { addEdgeTypeListener, addNodeTypeListener } from '../graph/events';
import { emitProfileEvent } from '../profiler/events';
import { ContentNodeId, UserNodeId, isContentID, isUserID } from '../graph/graphTypes';
import defaults from './defaultWeights.json';
import { ScoredRecommendation } from '../recommender/recommenderTypes';
import { trainProfile } from './training';
import { getCurrentUser, outOfDate, users, resetProfiles } from './state';
import { appendActionLog, addLogEntry, getActionLog, getActionLogSince } from './logs';

export { appendActionLog, addLogEntry, getCurrentUser, resetProfiles, getActionLog, getActionLogSince };

const defaultWeights = Array.from(Object.values(defaults));
const weightKeys = Array.from(Object.keys(defaults));
export { defaultWeights, weightKeys };

const TIME_WINDOW = 20 * 60 * 1000;
const TIME_DECAY = 0.5;

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
    featureWeights: number[];
}

addNodeTypeListener('user', (id: UserNodeId) => {
    const data = getNodeData<UserData>(id);
    if (data) {
        const profile: UserProfile = {
            id: id,
            name: data.name,
            engagement: -1,
            attributes: {},
            taste: [],
            engagedContent: [],
            reactedTopics: [],
            commentedTopics: [],
            seenTopics: [],
            sharedTopics: [],
            viewedTopics: [],
            followedTopics: [],
            featureWeights: data.featureWeights,
            seenItems: 0,
            engagementTotal: 0,
            positiveRecommendations: 0,
            negativeRecommendations: 0,
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

export function updateProfile(id: UserNodeId, profile: ProfileSummary) {
    outOfDate.add(id);

    addNodeIfNotExists('user', id);
    profile.engagedContent.forEach((c) => {
        const cid = isContentID(c.id) ? c.id : (`content:${c.id}` as ContentNodeId);
        addEdge('engaged', id, cid, c.weight);
        addEdge('engaged', cid, id, c.weight);
    });
    profile.taste.forEach((t) => {
        addEdge('topic', id, getTopicId(t.label), t.weight);
        addEdge('topic', getTopicId(t.label), id, t.weight);
    });

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
        taste: [],
        engagedContent: [],
        reactedTopics: [],
        commentedTopics: [],
        seenTopics: [],
        sharedTopics: [],
        viewedTopics: [],
        followedTopics: [],
        featureWeights: [...defaultWeights],
        seenItems: 0,
        engagementTotal: 0,
        positiveRecommendations: 0,
        negativeRecommendations: 0,
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

export function recreateUserProfile(id?: UserNodeId): UserProfile {
    const aid = id || getCurrentUser();
    const summary = createProfileSummaryById(aid, 10);
    const state = users.get(aid);

    // const seenItems = getRelated('seen', aid, { period: TIME_WINDOW });

    // Attempt to find data
    const data = getNodeData<UserData>(aid);

    return {
        ...summary,
        name: state?.name || data?.name || 'NoName',
        id: aid,
        engagement: summary.engagedContent.reduce((s, v) => s + v.weight, 0),
        attributes: {},
        featureWeights: data?.featureWeights || [...defaultWeights],
        seenItems: state?.seenItems || 0,
        engagementTotal: state?.engagementTotal || 0,
        positiveRecommendations: state?.positiveRecommendations || 0,
        negativeRecommendations: state?.negativeRecommendations || 0,
    };
}

export function getAllUsers(): string[] {
    return getNodesByType('user');
}

export function findTasteProfileById(id: UserNodeId, count?: number) {
    return getRelated('topic', id, { count, period: TIME_WINDOW, timeDecay: TIME_DECAY }).map((v) => ({
        label: getTopicLabel(v.id),
        weight: v.weight,
    }));
}

export function findTopContentById(id: UserNodeId, count?: number) {
    return getRelated('engaged', id, { count, period: TIME_WINDOW, timeDecay: TIME_DECAY });
}

export function findTasteProfile(count?: number) {
    return findTasteProfileById(getCurrentUser(), count);
}

export function findTopContent(count?: number) {
    return findTopContentById(getCurrentUser(), count);
}

export function createProfileSummary(count?: number): ProfileSummary {
    return createProfileSummaryById(getCurrentUser(), count);
}

export function createProfileSummaryById(id: UserNodeId, count?: number): ProfileSummary {
    const taste = findTasteProfileById(id, count);
    const engagedContent = findTopContentById(id, count);

    return {
        taste,
        engagedContent,
        commentedTopics: getRelated('commented_topic', id, { count, period: TIME_WINDOW, timeDecay: TIME_DECAY }).map(
            (r) => ({
                label: getTopicLabel(r.id),
                weight: r.weight,
            })
        ),
        seenTopics: getRelated('seen_topic', id, { period: TIME_WINDOW, timeDecay: TIME_DECAY }).map((r) => ({
            label: getTopicLabel(r.id),
            weight: r.weight,
        })),
        sharedTopics: getRelated('shared_topic', id, { count, period: TIME_WINDOW, timeDecay: TIME_DECAY }).map(
            (r) => ({
                label: getTopicLabel(r.id),
                weight: r.weight,
            })
        ),
        followedTopics: getRelated('followed_topic', id, { count, period: TIME_WINDOW, timeDecay: TIME_DECAY }).map(
            (r) => ({
                label: getTopicLabel(r.id),
                weight: r.weight,
            })
        ),
        reactedTopics: getRelated('reacted_topic', id, { count, period: TIME_WINDOW, timeDecay: TIME_DECAY }).map(
            (r) => ({
                label: getTopicLabel(r.id),
                weight: r.weight,
            })
        ),
        viewedTopics: getRelated('viewed_topic', id, { count, period: TIME_WINDOW, timeDecay: TIME_DECAY }).map(
            (r) => ({
                label: getTopicLabel(r.id),
                weight: r.weight,
            })
        ),
    };
}

export function updateEngagement(recommendation: ScoredRecommendation) {
    const weight = getEdgeWeights('last_engaged', getCurrentUser(), recommendation.contentId)[0] || 0;
    appendActionLog([{ activity: 'engagement', id: recommendation.contentId, value: weight, timestamp: Date.now() }]);

    const profile = users.get(getCurrentUser());
    if (profile) {
        trainProfile(recommendation, profile, weight);
    }
}
