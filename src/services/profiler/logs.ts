import { addEdge, addOrAccumulateEdge, getEdgeWeights } from '../graph/edges';
import { ContentNodeId, UserNodeId, WeightedNode } from '../graph/graphTypes';
import { getRelated } from '../graph/query';
import { emitLogEvent } from './events';
import { LogEntry } from './profilerTypes';
import { getCurrentUser, logs } from './state';

const MIN_DWELL_TIME = 2000;
const MAX_DWELL_TIME = 10000;

function affinityBoost(id: UserNodeId, content: ContentNodeId, weight: number) {
    const topics = getRelated('topic', content);
    topics.forEach((t) => {
        const engageScore = (getEdgeWeights('engaged_topic', id, t.id)[0] || 0) + t.weight * weight;
        addEdge('engaged_topic', id, t.id, engageScore);

        const seenScore = getEdgeWeights('seen_topic', id, t.id)[0] || 1;

        addEdge('topic', id, t.id, engageScore / seenScore);
        addEdge('topic', t.id, getCurrentUser(), engageScore / seenScore);
    });

    addOrAccumulateEdge('engaged', id, content, weight);
    addOrAccumulateEdge('last_engaged', id, content, weight);
}

type TopicEdgeTypes =
    | 'reacted_topic'
    | 'shared_topic'
    | 'followed_topic'
    | 'seen_topic'
    | 'viewed_topic'
    | 'commented_topic';

function boostTopics(id: UserNodeId, type: TopicEdgeTypes, content: ContentNodeId) {
    const topics = getRelated('topic', content);
    topics.forEach((t) => {
        if (t.weight === 0) return;
        addOrAccumulateEdge(type, id, t.id, 1.0);
    });
}

function normDwell(d: number): number {
    return Math.max(0, Math.min(10, (d - MIN_DWELL_TIME) / (MAX_DWELL_TIME - MIN_DWELL_TIME)));
}

const engageLog = new Map<UserNodeId, WeightedNode<ContentNodeId>[]>();

function processEngagement(id: UserNodeId, content: ContentNodeId, engagement: number) {
    if (engagement > 0) {
        const elog = engageLog.get(id) || [];
        // Now add some co-engagement edges
        let w = engagement;
        for (let i = elog.length - 1; i >= Math.max(0, elog.length - 6); --i) {
            addOrAccumulateEdge('coengaged', content, elog[i].id, w * elog[i].weight);
            addOrAccumulateEdge('coengaged', elog[i].id, content, w * elog[i].weight);
            w *= 0.5;
        }
        elog.push({ id: content, weight: engagement });
        engageLog.set(id, elog);
    }
}

export function addLogEntry(data: LogEntry, id?: UserNodeId, noEvent?: boolean) {
    const aid = id || getCurrentUser();
    const logArray: LogEntry[] = logs.get(aid) || [];

    logArray.push(data);
    logs.set(aid, logArray);

    const cid = (data.id || '') as ContentNodeId;

    switch (data.activity) {
        case 'seen':
            addEdge('last_engaged', aid, cid, 0);
            boostTopics(aid, 'seen_topic', cid);
            addOrAccumulateEdge('seen', aid, cid, 1);
            break;
        case 'like':
            affinityBoost(aid, cid, 0.1);
            boostTopics(aid, 'reacted_topic', cid);
            break;
        case 'laugh':
        case 'anger':
        case 'sad':
        case 'wow':
        case 'love':
            affinityBoost(aid, cid, 0.2);
            boostTopics(aid, 'reacted_topic', cid);
            break;
        case 'share_public':
            affinityBoost(aid, cid, 0.5);
            boostTopics(aid, 'shared_topic', cid);
            break;
        case 'share_private':
            affinityBoost(aid, cid, 0.1);
            boostTopics(aid, 'shared_topic', cid);
            break;
        case 'share_friends':
            affinityBoost(aid, cid, 0.3);
            boostTopics(aid, 'shared_topic', cid);
            break;
        case 'dwell':
            affinityBoost(aid, cid, normDwell(data.value || 0) * 0.3);
            if (data.value && data.value > 2000) boostTopics(aid, 'viewed_topic', cid);
            break;
        case 'follow':
            affinityBoost(aid, cid, 0.5);
            boostTopics(aid, 'followed_topic', cid);
            break;
        case 'comment':
            affinityBoost(aid, cid, Math.min(1, (data.value || 0) / 80) * 0.6);
            boostTopics(aid, 'commented_topic', cid);
            break;
        case 'engagement':
            processEngagement(aid, cid, data.value || 0);
            break;
    }

    if (!noEvent) emitLogEvent(aid);
}

export function appendActionLog(data: LogEntry[], id?: UserNodeId) {
    const aid = id || getCurrentUser();

    data.forEach((d) => {
        addLogEntry(d, aid, true);
    });
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
