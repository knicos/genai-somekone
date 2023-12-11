import { LogEntry } from './profilerTypes';
import { ProfileSummary, UserProfile } from '../profiler/profilerTypes';
import {
    addNode,
    addNodeIfNotExists,
    getNodesByType,
    getRelated,
    addOrAccumulateEdge,
    getEdgeWeights,
    addEdge,
} from '@genaism/services/graph/graph';
import { getTopicId, getTopicLabel } from '@genaism/services/concept/concept';
import { addEdgeTypeListener } from '../graph/events';
import { emitLogEvent, emitProfileEvent } from '../profiler/events';
import { ContentNodeId, UserNodeId, isContentID } from '../graph/graphTypes';

const MIN_DWELL_TIME = 2000;
const MAX_DWELL_TIME = 10000;
const TIME_WINDOW = 20 * 60 * 1000;
const TIME_DECAY = 0.5;

let userID: UserNodeId | undefined;

const users = new Map<UserNodeId, UserProfile>();
const logs = new Map<UserNodeId, LogEntry[]>();

const outOfDate = new Set<string>();

export function resetProfiles() {
    users.clear();
    logs.clear();
    outOfDate.clear();
    userID = undefined;
}

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

export function getCurrentUser(): UserNodeId {
    if (!userID) userID = addNode('user');
    return userID;
}

export function setUserName(id: UserNodeId, name: string) {
    const current = users.get(id) || {
        id,
        name,
        engagedContent: [],
        similarUsers: [],
        seenTopics: [],
        reactedTopics: [],
        followedTopics: [],
        commentedTopics: [],
        sharedTopics: [],
        viewedTopics: [],
        taste: [],
        attributes: {},
        engagement: -1,
    };
    users.set(id, { ...current, name });
}

export function addUserProfile(profile: UserProfile) {
    outOfDate.add(profile.id);

    console.log('Adding user', profile.name);
    addNode('user', profile.id);
    profile.engagedContent.forEach((c) => {
        const cid = isContentID(c.id) ? c.id : (`content:${c.id}` as ContentNodeId);
        addEdge('engaged', profile.id, cid, c.weight);
        addEdge('engaged', cid, profile.id, c.weight);
    });
    profile.taste.forEach((t) => {
        addEdge('topic', profile.id, getTopicId(t.label), t.weight);
        addEdge('topic', getTopicId(t.label), profile.id, t.weight);
    });

    users.set(profile.id, profile);
    emitProfileEvent(profile.id);
}

export function updateProfile(id: UserNodeId, profile: ProfileSummary) {
    outOfDate.add(id);

    addNodeIfNotExists('user', id);
    profile.engagedContent.forEach((c) => {
        addEdge('engaged', id, c.id, c.weight);
        addEdge('engaged', c.id, id, c.weight);
    });
    profile.taste.forEach((t) => {
        console.log('Add topic edges', id, getTopicId(t.label));
        console.log('Add edge', addEdge('topic', id, getTopicId(t.label), t.weight));
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

export function createUserProfile(id: UserNodeId, name: string): UserProfile {
    const profile: UserProfile = {
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
    };
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
    return {
        ...summary,
        name: state?.name || 'NoName',
        id: aid,
        engagement: -1,
        attributes: {},
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
        seenTopics: getRelated('seen_topic', id, { count, period: TIME_WINDOW, timeDecay: TIME_DECAY }).map((r) => ({
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

export function prettyProfile() {
    if (!userID) newUser();

    const topics = getRelated('topic', getCurrentUser(), { count: 10 });
    const names = topics.map((t) => `${getTopicLabel(t.id)} (${t.weight.toFixed(1)})`);
    console.log(names);
}

export function newUser() {
    userID = addNode('user');
}

function affinityBoost(content: ContentNodeId, weight: number) {
    const topics = getRelated('topic', content);
    topics.forEach((t) => {
        const engageScore = (getEdgeWeights('engaged_topic', getCurrentUser(), t.id)[0] || 0) + t.weight * weight;
        addEdge('engaged_topic', getCurrentUser(), t.id, engageScore);

        const seenScore = getEdgeWeights('seen_topic', getCurrentUser(), t.id)[0] || 1;

        addEdge('topic', getCurrentUser(), t.id, engageScore / seenScore);
    });

    addOrAccumulateEdge('engaged', getCurrentUser(), content, weight);
}

type TopicEdgeTypes =
    | 'reacted_topic'
    | 'shared_topic'
    | 'followed_topic'
    | 'seen_topic'
    | 'viewed_topic'
    | 'commented_topic';

function boostTopics(type: TopicEdgeTypes, content: ContentNodeId) {
    const topics = getRelated('topic', content);
    topics.forEach((t) => {
        if (t.weight === 0) return;
        addOrAccumulateEdge(type, getCurrentUser(), t.id, 1.0);
    });
}

function normDwell(d: number): number {
    return Math.max(0, Math.min(10, (d - MIN_DWELL_TIME) / (MAX_DWELL_TIME - MIN_DWELL_TIME)));
}

export function addLogEntry(data: LogEntry) {
    const logArray: LogEntry[] = logs.get(getCurrentUser()) || [];
    const changed = logArray.length > 0 ? logArray[logArray.length - 1].id !== data.id : false;

    if (changed) {
        const prev = logArray[logArray.length - 1];
        const weight = getEdgeWeights('engaged', getCurrentUser(), prev.id as ContentNodeId)[0] || 0;
        appendActionLog([{ activity: 'engagement', id: prev.id, value: weight, timestamp: Date.now() }]);
    }

    logArray.push(data);
    logs.set(getCurrentUser(), logArray);

    const id = (data.id || '') as ContentNodeId;

    switch (data.activity) {
        case 'seen':
            boostTopics('seen_topic', id);
            addOrAccumulateEdge('seen', getCurrentUser(), id, 1);
            break;
        case 'like':
            affinityBoost(id, 0.1);
            boostTopics('reacted_topic', id);
            break;
        case 'laugh':
        case 'anger':
        case 'sad':
        case 'wow':
        case 'love':
            affinityBoost(id, 0.2);
            boostTopics('reacted_topic', id);
            break;
        case 'share_public':
            affinityBoost(id, 0.5);
            boostTopics('shared_topic', id);
            break;
        case 'share_private':
            affinityBoost(id, 0.1);
            boostTopics('shared_topic', id);
            break;
        case 'share_friends':
            affinityBoost(id, 0.3);
            boostTopics('shared_topic', id);
            break;
        case 'dwell':
            affinityBoost(id, normDwell(data.value || 0) * 0.3);
            if (data.value && data.value > 2000) boostTopics('viewed_topic', id);
            break;
        case 'follow':
            affinityBoost(id, 0.5);
            boostTopics('followed_topic', id);
            break;
        case 'comment':
            affinityBoost(id, Math.min(1, (data.value || 0) / 80) * 0.6);
            boostTopics('commented_topic', id);
            break;
    }

    emitLogEvent(getCurrentUser());
}

export function appendActionLog(data: LogEntry[], id?: UserNodeId) {
    const aid = id || getCurrentUser();
    const logArray: LogEntry[] = logs.get(aid) || [];
    logArray.push(...data);
    logs.set(aid, logArray);
    emitLogEvent(aid);
}

export function getActionLog(id?: UserNodeId): LogEntry[] {
    const aid = id || getCurrentUser();
    return logs.get(aid) || [];
}

export function getActionLogSince(timestamp: number, id?: UserNodeId): LogEntry[] {
    const result: LogEntry[] = [];
    const log = getActionLog(id);

    for (let i = log.length - 1; i >= 0; --i) {
        if (log[i].timestamp > timestamp) {
            result.push(log[i]);
        } else {
            break;
        }
    }
    return result.reverse();
}
