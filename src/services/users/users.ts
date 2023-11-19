import { ProfileSummary, UserProfile } from '../profiler/profilerTypes';
import { addEdge, addNode, addNodeIfNotExists, getNodesByType, getRelated } from '@genaism/services/graph/graph';
import { getTopicId, getTopicLabel } from '@genaism/services/concept/concept';
import { useRelatedNodes } from '../graph/hooks';
import { useMemo } from 'react';

let userID: string;

interface UserState {
    name?: string;
}

const users = new Map<string, UserState>();

export function getCurrentUser(): string {
    if (!userID) newUser();
    return userID;
}

export function setUserName(id: string, name: string) {
    const current = users.get(id);
    users.set(id, { ...current, name });
}

export function addUserProfile(profile: UserProfile) {
    console.log('Adding user', profile.name);
    addNode('user', profile.id);
    profile.engagedContent.forEach((c) => {
        addEdge('engaged', profile.id, c.id, c.weight);
    });
    profile.taste.forEach((t) => {
        addEdge('topic', profile.id, getTopicId(t.label), t.weight);
    });
    users.set(profile.id, { name: profile.name });
}

export function updateProfile(id: string, profile: ProfileSummary) {
    addNodeIfNotExists('user', id);
    profile.engagedContent.forEach((c) => {
        addEdge('engaged', id, c.id, c.weight);
    });
    profile.taste.forEach((t) => {
        addEdge('topic', id, getTopicId(t.label), t.weight);
    });
}

export function getUserProfile(id?: string): UserProfile {
    const aid = id || getCurrentUser();
    const summary = getProfileSummaryById(aid, 10);
    const state = users.get(aid) || {};
    return {
        ...summary,
        name: state.name || 'NoName',
        id: aid,
        engagement: -1,
        attributes: {},
    };
}

export function useUserProfile(id?: string): UserProfile {
    const aid = id || getCurrentUser();
    const engagedContent = useRelatedNodes(aid, 'engaged', 10);
    const taste = useRelatedNodes(aid, 'topic', 10);

    return useMemo(() => {
        const state = users.get(aid) || {};
        return {
            engagedContent,
            taste: taste.map((t) => ({ label: getTopicLabel(t.id), weight: t.weight })),
            similarUsers: [],
            name: state.name || 'NoName',
            id: aid,
            engagement: -1,
            attributes: {},
        };
    }, [aid, taste, engagedContent]);
}

export function getAllUsers(): string[] {
    return getNodesByType('user');
}

export function getTasteProfileById(id: string, count?: number) {
    return getRelated('topic', id, count).map((v) => ({ label: getTopicLabel(v.id), weight: v.weight }));
}

export function getTopContentById(id: string, count?: number) {
    return getRelated('engaged', id, count);
}

export function getTasteProfile(count?: number) {
    return getTasteProfileById(userID, count);
}

export function getTopContent(count?: number) {
    return getTopContentById(userID, count);
}

export function getProfileSummary(count?: number): ProfileSummary {
    return {
        taste: getTasteProfile(count),
        engagedContent: getTopContent(count),
        similarUsers: [],
    };
}

export function getProfileSummaryById(id: string, count?: number): ProfileSummary {
    return {
        taste: getTasteProfileById(id, count),
        engagedContent: getTopContentById(id, count),
        similarUsers: [],
    };
}

export function prettyProfile() {
    if (!userID) newUser();

    const topics = getRelated('topic', userID, 10);
    const names = topics.map((t) => `${getTopicLabel(t.id)} (${t.weight.toFixed(1)})`);
    console.log(names);
}

export function newUser() {
    userID = addNode('user');
}
