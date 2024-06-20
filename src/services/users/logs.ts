import { anonString } from '@genaism/util/anon';
import { addContentEngagement, addContentReaction, addContentShare, removeContentReaction } from '../content/content';
import { addEdge, addOrAccumulateEdge, getEdge } from '../graph/edges';
import { ContentNodeId, UserNodeId, WeightedNode } from '../graph/graphTypes';
import { getRelated } from '../graph/query';
import { emitLogDataEvent, emitLogEvent } from './events';
import { LogActivity, LogEntry } from './userTypes';
import { getCurrentUser } from '../profiler/state';
import { UserLogEntry, logs, logsByType } from './state';

const MIN_DWELL_TIME = 2000;
const MAX_DWELL_TIME = 10000;
// const MAX_AFFINITY_AGE = 2 * 60 * 1000;
// const MIN_AFFINITY_DECAY = 0.1;

function affinityBoost(id: UserNodeId, content: ContentNodeId, weight: number, timestamp: number) {
    addOrAccumulateEdge('engaged', id, content, weight, timestamp);
    addOrAccumulateEdge('engaged', content, id, weight, timestamp);
    addOrAccumulateEdge('last_engaged', id, content, weight, timestamp);
}

type TopicEdgeTypes =
    | 'reacted_topic'
    | 'shared_topic'
    | 'followed_topic'
    | 'seen_topic'
    | 'viewed_topic'
    | 'commented_topic';

function boostTopics(id: UserNodeId, type: TopicEdgeTypes, content: ContentNodeId, timestamp: number) {
    const topics = getRelated('topic', content);
    topics.forEach((t) => {
        if (t.weight === 0) return;
        const edge = getEdge(type, id, t.id);
        addEdge(type, id, t.id, (edge ? edge.weight : 0) + 1, timestamp);
    });
}

/*function decayEdge(edge: Edge<UserNodeId, TopicNodeId>) {
    const now = Date.now();
    const age = now - edge.timestamp;
    const normAge = 1.0 - Math.min(1, age / MAX_AFFINITY_AGE);
    const normAge2 = normAge * normAge * (1 - MIN_AFFINITY_DECAY) + MIN_AFFINITY_DECAY;
    return edge.weight * normAge2;
}*/

function normDwell(d: number): number {
    return Math.max(0, Math.min(10, (d - MIN_DWELL_TIME) / (MAX_DWELL_TIME - MIN_DWELL_TIME)));
}

const engageLog = new Map<UserNodeId, WeightedNode<ContentNodeId>[]>();

function processEngagement(id: UserNodeId, content: ContentNodeId, engagement: number, timestamp: number) {
    if (engagement > 0) {
        const topics = getRelated('topic', content);

        topics.forEach((t) => {
            const edge = getEdge('engaged_topic', id, t.id);
            const oldWeight = edge ? edge.weight : 0;
            const engageScore = oldWeight + t.weight * engagement;
            addEdge('engaged_topic', id, t.id, engageScore, timestamp);

            //const seenEdge = getEdge('seen_topic', id, t.id);
            //const seenScore = seenEdge ? decayEdge(seenEdge) : 1;

            addEdge('topic', id, t.id, engageScore, timestamp);
            addEdge('topic', t.id, id, engageScore, timestamp);
        });

        const elog = engageLog.get(id) || [];
        // Now add some co-engagement edges
        let w = 1;
        for (let i = elog.length - 1; i >= Math.max(0, elog.length - 6); --i) {
            if (content !== elog[i].id) {
                // Average of the engagement scores weighted by distance in time
                const avgWeight = ((elog[i].weight + engagement) / 2) * w;
                addOrAccumulateEdge('coengaged', content, elog[i].id, avgWeight, timestamp);
                addOrAccumulateEdge('coengaged', elog[i].id, content, avgWeight, timestamp);
            }
            w *= 0.9;
        }
        elog.push({ id: content, weight: engagement });
        engageLog.set(id, elog);
    } else {
        const topics = getRelated('topic', content);

        topics.forEach((t) => {
            const edge = getEdge('engaged_topic', id, t.id);
            const oldWeight = edge ? edge.weight : 0;
            const engageScore = Math.max(0, oldWeight - t.weight * 0.01);
            addEdge('engaged_topic', id, t.id, engageScore, timestamp);

            //const seenEdge = getEdge('seen_topic', id, t.id);
            //const seenScore = seenEdge ? decayEdge(seenEdge) : 1;

            addEdge('topic', id, t.id, engageScore, timestamp);
            addEdge('topic', t.id, id, engageScore, timestamp);
        });
    }
}

export function processLogEntry(data: LogEntry, id?: UserNodeId, noEvent?: boolean) {
    const aid = id || getCurrentUser();
    const cid = (data.id || '') as ContentNodeId;

    switch (data.activity) {
        case 'seen':
            addEdge('last_engaged', aid, cid, 0, data.timestamp);
            boostTopics(aid, 'seen_topic', cid, data.timestamp);
            addOrAccumulateEdge('seen', aid, cid, 1, data.timestamp);
            break;
        case 'like':
            affinityBoost(aid, cid, 0.1, data.timestamp);
            boostTopics(aid, 'reacted_topic', cid, data.timestamp);
            addContentReaction(cid);
            break;
        case 'unreact':
            affinityBoost(aid, cid, -0.1, data.timestamp);
            removeContentReaction(cid);
            break;
        case 'share_public':
            affinityBoost(aid, cid, 0.5, data.timestamp);
            boostTopics(aid, 'shared_topic', cid, data.timestamp);
            addContentShare(cid);
            break;
        case 'share_private':
            affinityBoost(aid, cid, 0.1, data.timestamp);
            boostTopics(aid, 'shared_topic', cid, data.timestamp);
            addContentShare(cid);
            break;
        case 'share_friends':
            affinityBoost(aid, cid, 0.3, data.timestamp);
            boostTopics(aid, 'shared_topic', cid, data.timestamp);
            addContentShare(cid);
            break;
        case 'dwell':
            affinityBoost(aid, cid, normDwell(data.value || 0) * 0.3, data.timestamp);
            if (data.value && data.value > 2000) boostTopics(aid, 'viewed_topic', cid, data.timestamp);
            break;
        case 'follow':
            affinityBoost(aid, cid, 0.5, data.timestamp);
            boostTopics(aid, 'followed_topic', cid, data.timestamp);
            break;
        case 'unfollow':
            affinityBoost(aid, cid, -0.5, data.timestamp);
            break;
        case 'comment':
            affinityBoost(aid, cid, Math.min(1, (data.value || 0) / 80) * 0.6, data.timestamp);
            boostTopics(aid, 'commented_topic', cid, data.timestamp);
            break;
        case 'engagement':
            processEngagement(aid, cid, data.value || 0, data.timestamp);
            addContentEngagement(cid, data.value || 0);
            break;
    }

    if (!noEvent) {
        emitLogEvent(aid);
        emitLogDataEvent(aid, data);
    }
}

export function addLogEntry(data: LogEntry, id?: UserNodeId, noEvent?: boolean) {
    const aid = id || getCurrentUser();
    const logArray: LogEntry[] = logs.get(aid) || [];

    logArray.push(data);

    /*if (logArray.length > 0 && logArray[logArray.length - 1].timestamp > data.timestamp) {
        console.warn('Skipping old log', data);
        return;
    }*/

    logs.set(aid, logArray);
    const logType = logsByType.get(data.activity);
    const logTypeA = logType || [];
    if (!logType) logsByType.set(data.activity, logTypeA);
    logTypeA.push({ user: aid, entry: data });

    processLogEntry(data, aid, noEvent);
}

export function appendActionLog(data: LogEntry[], id?: UserNodeId, noProcess?: boolean) {
    const aid = id || getCurrentUser();

    if (noProcess) {
        const logArray: LogEntry[] = logs.get(aid) || [];
        logs.set(aid, [...logArray, ...data]);
    } else {
        data.forEach((d) => {
            addLogEntry(d, aid, true);
        });
    }
    emitLogEvent(aid);
    data.forEach((d) => emitLogDataEvent(aid, d));
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

// Note: Assumes logs are always added in timestamp order
export function getActionLogTypeSince(timestamp: number, type: LogActivity): UserLogEntry[] {
    const result: UserLogEntry[] = [];
    const log = logsByType.get(type) || [];

    for (let i = log.length - 1; i >= 0; --i) {
        if (log[i].entry.timestamp > timestamp) {
            result.push(log[i]);
        } else {
            break;
        }
    }
    return result.reverse();
}

export function anonLogs() {
    logs.forEach((entry) => {
        entry.forEach((log) => {
            if (log.activity === 'comment') {
                if (log.content) {
                    log.content = anonString(log.content);
                }
            }
        });
    });
}

export function sortLogs() {
    logsByType.forEach((log) => {
        log.sort((a, b) => a.entry.timestamp - b.entry.timestamp);
    });
}
