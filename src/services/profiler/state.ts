import { UserNodeId } from '../graph/graphTypes';
import { addNode } from '../graph/nodes';
import { LogEntry, UserProfile } from './profilerTypes';

let userID: UserNodeId | undefined;

export const users = new Map<UserNodeId, UserProfile>();
export const logs = new Map<UserNodeId, LogEntry[]>();
export const outOfDate = new Set<string>();

export function resetProfiles() {
    users.clear();
    logs.clear();
    outOfDate.clear();
    userID = undefined;
}

export function getCurrentUser(): UserNodeId {
    if (!userID) userID = addNode('user');
    return userID;
}

export function newUser() {
    userID = addNode('user');
}
