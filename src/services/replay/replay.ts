import { useEffect, useRef, useState } from 'react';
import { resetTopics } from '../concept/concept';
import { rebuildContent } from '../content/content';
import { UserNodeId } from '../graph/graphTypes';
import { addNode, getNodeData, getNodesByType } from '../graph/nodes';
import { resetGraph } from '../graph/state';
import { getActionLog, processLogEntry } from '../profiler/logs';
import { clearProfile, getUserProfile } from '../profiler/profiler';
import { LogEntry } from '../profiler/profilerTypes';
import { resetProfiles } from '../profiler/state';
import { scoreCandidates } from '../recommender/scoring';
import { trainProfile } from '../profiler/training';
import { getEdgeWeights } from '../graph/edges';
import { ScoredRecommendation } from '../recommender/recommenderTypes';

const cacheRecommendations = new Map<string, ScoredRecommendation>();

function firstTimestamp(users: UserNodeId[]) {
    let firstTS = Date.now();
    users.forEach((user) => {
        const logs = getActionLog(user);
        firstTS = Math.min(firstTS, logs[0]?.timestamp || firstTS);
    });

    return firstTS;
}

function endTimestamp(users: UserNodeId[]) {
    let lastTS = 0;
    users.forEach((user) => {
        const logs = getActionLog(user);
        lastTS = Math.max(lastTS, logs[logs.length - 1]?.timestamp || lastTS);
    });

    return lastTS;
}

function replayEntry(id: UserNodeId, log: LogEntry) {
    if (log.activity === 'seen') {
        const profile = getUserProfile(id);
        const scores = scoreCandidates(
            [
                {
                    contentId: log.id || 'content:none',
                    timestamp: log.timestamp,
                    candidateOrigin: 'topic_affinity',
                },
            ],
            profile
        );
        cacheRecommendations.set(id + log.id, scores[0]);
    }
    processLogEntry(log, id);

    if (log.activity === 'engagement') {
        const profile = getUserProfile(id);
        const score = cacheRecommendations.get(id + log.id);
        if (score) {
            const weight = getEdgeWeights('last_engaged', id, score.contentId)[0] || 0;
            trainProfile(score, profile, weight);
        }
    }
}

function replayUserEntries(id: UserNodeId, index: number, end: number) {
    const logs = getActionLog(id);
    let count = 0;
    for (let i = index; i < logs.length; ++i) {
        if (logs[i].timestamp <= end) {
            replayEntry(id, logs[i]);
            ++count;
        } else {
            return i;
        }
    }
    if (count > 0) clearProfile(id);
    return logs.length;
}

/*function averageWeights(users: UserNodeId[]) {
    const weights: number[] = [];
    users.forEach((user) => {
        const profile = getUserProfile(user);
        if (weights.length === 0) {
            profile.featureWeights.forEach(() => weights.push(0));
        }

        profile.featureWeights.forEach((value, ix) => {
            weights[ix] += value;
        });
    });

    weights.forEach((w, ix) => {
        weights[ix] = w / users.length;
    });

    console.log('Average weights:', weights);
}*/

interface ReplayState {
    startTime: number;
    endTime: number;
    indexes: Map<UserNodeId, number>;
}

interface UserData {
    name: string;
}

export function useLogReplay(speed: number) {
    const [active, setActive] = useState(false);
    const [paused, setPaused] = useState(false);
    const state = useRef<ReplayState>({
        startTime: Date.now(),
        endTime: 0,
        indexes: new Map<UserNodeId, number>(),
    });
    const [currentTime, setCurrentTime] = useState(0);

    useEffect(() => {
        if (active) {
            const users = getNodesByType('user');
            const data = new Map<UserNodeId, UserData>();
            users.forEach((user) => {
                const d = getNodeData<UserData>(user);
                if (d) data.set(user, d);
            });

            resetGraph();
            resetTopics();
            resetProfiles(true);
            rebuildContent();
            cacheRecommendations.clear();

            users.forEach((user) => {
                if (getActionLog(user)?.length > 0) {
                    addNode('user', user, { name: data.get(user)?.name });
                }
            });

            state.current.startTime = firstTimestamp(users);
            state.current.endTime = endTimestamp(users);
            state.current.indexes = new Map<UserNodeId, number>();
            setCurrentTime(state.current.startTime);
        }
    }, [active]);

    useEffect(() => {
        if (active && !paused) {
            const interval = window.setInterval(() => {
                setCurrentTime((old) => (old += 200 * (speed || 1)));
            }, 200);
            return () => clearInterval(interval);
        }
    }, [active, paused, speed]);

    useEffect(() => {
        const users = getNodesByType('user');
        users.forEach((user) => {
            const startIx = state.current.indexes.get(user) || 0;
            const endIx = replayUserEntries(user, startIx, currentTime);
            state.current.indexes.set(user, endIx);
        });

        // averageWeights(users);
    }, [currentTime]);

    return {
        startTime: state.current.startTime,
        endTime: state.current.endTime,
        time: currentTime,
        active,
        paused,
        stop: () => setActive(false),
        start: () => {
            setActive(true);
            setPaused(false);
        },
        pause: () => setPaused(true),
    };
}
