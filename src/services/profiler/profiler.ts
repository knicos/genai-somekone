import { LogEntry } from './profilerTypes';
import { ProfileSummary, UserProfile } from '../profiler/profilerTypes';
import {
    addBiEdge,
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
import { emitProfileEvent } from '../profiler/events';
import { EdgeType } from '../graph/graphTypes';

const MIN_DWELL_TIME = 2000;
const MAX_DWELL_TIME = 10000;

let userID: string | undefined;

const users = new Map<string, UserProfile>();
const logs = new Map<string, LogEntry[]>();

const outOfDate = new Set<string>();

export function resetProfiles() {
    users.clear();
    logs.clear();
    outOfDate.clear();
    userID = undefined;
}

addEdgeTypeListener('engaged', (id: string) => {
    if (users.has(id)) {
        outOfDate.add(id);
        emitProfileEvent(id);
    }
});
addEdgeTypeListener('topic', (id: string) => {
    if (users.has(id)) {
        outOfDate.add(id);
        emitProfileEvent(id);
    }
});

export function getCurrentUser(): string {
    if (!userID) userID = addNode('user');
    return userID;
}

export function setUserName(id: string, name: string) {
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
    console.log('Adding user', profile.name);
    addNode('user', profile.id);
    profile.engagedContent.forEach((c) => {
        addBiEdge('engaged', profile.id, c.id, c.weight);
    });
    profile.taste.forEach((t) => {
        addBiEdge('topic', profile.id, getTopicId(t.label), t.weight);
    });

    users.set(profile.id, profile);
    outOfDate.add(profile.id);
    emitProfileEvent(profile.id);
}

export function updateProfile(id: string, profile: ProfileSummary) {
    addNodeIfNotExists('user', id);
    profile.engagedContent.forEach((c) => {
        addBiEdge('engaged', id, c.id, c.weight);
    });
    profile.taste.forEach((t) => {
        addBiEdge('topic', id, getTopicId(t.label), t.weight);
    });

    outOfDate.add(id);
    emitProfileEvent(id);
}

export function getUserProfile(id?: string): UserProfile {
    const aid = id || getCurrentUser();
    const profile = users.get(aid);

    if (profile && !outOfDate.has(aid)) return profile;

    console.log('Recreating profile', id, outOfDate);

    const newProfile = recreateUserProfile(aid);
    users.set(aid, newProfile);
    outOfDate.delete(aid);
    return newProfile;
}

export function recreateUserProfile(id?: string): UserProfile {
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

export function findTasteProfileById(id: string, count?: number) {
    return getRelated('topic', id, count).map((v) => ({ label: getTopicLabel(v.id), weight: v.weight }));
}

export function findTopContentById(id: string, count?: number) {
    return getRelated('engaged', id, count);
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

export function createProfileSummaryById(id: string, count?: number): ProfileSummary {
    const taste = findTasteProfileById(id, count);
    const engagedContent = findTopContentById(id, count);

    return {
        taste,
        engagedContent,
        commentedTopics: getRelated('commented_topic', id, count),
        seenTopics: getRelated('seen_topic', id, count),
        sharedTopics: getRelated('shared_topic', id, count),
        followedTopics: getRelated('followed_topic', id, count),
        reactedTopics: getRelated('reacted_topic', id, count),
        viewedTopics: getRelated('viewed_topic', id, count),
    };
}

export function prettyProfile() {
    if (!userID) newUser();

    const topics = getRelated('topic', getCurrentUser(), 10);
    const names = topics.map((t) => `${getTopicLabel(t.id)} (${t.weight.toFixed(1)})`);
    console.log(names);
}

export function newUser() {
    userID = addNode('user');
}

function affinityBoost(content: string, weight: number) {
    const topics = getRelated('topic', content || '');
    topics.forEach((t) => {
        const engageScore = (getEdgeWeights('engaged_topic', getCurrentUser(), t.id)[0] || 0) + t.weight * weight;
        addEdge('engaged_topic', getCurrentUser(), t.id, engageScore);

        const seenScore = getEdgeWeights('seen_topic', getCurrentUser(), t.id)[0] || 1;

        addEdge('topic', getCurrentUser(), t.id, engageScore / seenScore);
    });

    addOrAccumulateEdge('engaged', getCurrentUser(), content, weight);
}

function boostTopics(type: EdgeType, content: string) {
    const topics = getRelated('topic', content || '');
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
        const weight = getEdgeWeights('engaged', getCurrentUser(), prev.id)[0] || 0;
        appendActionLog([{ activity: 'engagement', id: prev.id, value: weight, timestamp: Date.now() }]);
    }

    logArray.push(data);
    logs.set(getCurrentUser(), logArray);

    switch (data.activity) {
        case 'seen':
            boostTopics('seen_topic', data.id || '');
            break;
        case 'like':
            affinityBoost(data.id || '', 0.1);
            boostTopics('reacted_topic', data.id || '');
            break;
        case 'laugh':
        case 'anger':
        case 'sad':
        case 'wow':
        case 'love':
            affinityBoost(data.id || '', 0.2);
            boostTopics('reacted_topic', data.id || '');
            break;
        case 'share_public':
            affinityBoost(data.id || '', 0.5);
            boostTopics('shared_topic', data.id || '');
            break;
        case 'share_private':
            affinityBoost(data.id || '', 0.1);
            boostTopics('shared_topic', data.id || '');
            break;
        case 'share_friends':
            affinityBoost(data.id || '', 0.3);
            boostTopics('shared_topic', data.id || '');
            break;
        case 'dwell':
            affinityBoost(data.id || '', normDwell(data.value || 0) * 0.3);
            if (data.value && data.value > 2000) boostTopics('viewed_topic', data.id || '');
            break;
        case 'follow':
            affinityBoost(data.id || '', 0.5);
            boostTopics('followed_topic', data.id || '');
            break;
        case 'comment':
            affinityBoost(data.id || '', Math.min(1, (data.value || 0) / 80) * 0.6);
            boostTopics('commented_topic', data.id || '');
            break;
    }
}

export function appendActionLog(data: LogEntry[], id?: string) {
    const aid = id || getCurrentUser();
    const logArray: LogEntry[] = logs.get(aid) || [];
    logArray.push(...data);
    logs.set(aid, logArray);
}

export function getActionLog(id?: string): LogEntry[] {
    const aid = id || getCurrentUser();
    return logs.get(aid) || [];
}

export function getActionLogSince(timestamp: number, id?: string): LogEntry[] {
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
