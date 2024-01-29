import { UserNodeId, isUserID } from '../graph/graphTypes';
import { addNode } from '../graph/nodes';
import { LogEntry, UserProfile } from './profilerTypes';

const USER_KEY = 'genai_somekone_userID';

let userID: UserNodeId | undefined;

const sessionUserID = window.sessionStorage.getItem(USER_KEY);
if (sessionUserID && isUserID(sessionUserID)) {
    userID = sessionUserID;
    addNode('user', userID);
}

export const users = new Map<UserNodeId, UserProfile>();
export const logs = new Map<UserNodeId, LogEntry[]>();
export const outOfDate = new Set<string>();

export function resetProfiles(excludeLogs?: boolean) {
    users.clear();
    if (!excludeLogs) logs.clear();
    outOfDate.clear();
    userID = undefined;
}

export function setUser(id: UserNodeId) {
    userID = addNode('user', id);
    window.sessionStorage.setItem(USER_KEY, userID);
}

export function newUser() {
    userID = addNode('user');
    window.sessionStorage.setItem(USER_KEY, userID);
}

export function getCurrentUser(): UserNodeId {
    if (!userID) {
        userID = addNode('user');
        window.sessionStorage.setItem(USER_KEY, userID);
    }
    return userID;
}
