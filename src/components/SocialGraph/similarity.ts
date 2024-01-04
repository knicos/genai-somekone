import { UserNodeId, WeightedNode } from '@genaism/services/graph/graphTypes';
import { addAnyProfileListener, removeAnyProfileListener } from '@genaism/services/profiler/events';
import { getUserProfile } from '@genaism/services/profiler/profiler';
import { findSimilarUsers } from '@genaism/services/users/users';
import { useEffect, useRef, useState } from 'react';

export interface Similarities {
    nodes: WeightedNode<UserNodeId>[];
    maxSimilarity: number;
    minSimilarity: number;
    sumSimilarity: number;
}

const COLOURS = [
    '#2e6df5',
    '#19b1a8',
    '#fad630',
    '#fd9d32',
    '#e04f66',
    '#a77bca',
    '#c2a251',
    '#97999b',
    '#8bbee8',
    '#a2e4b8',
    '#fecb8b',
    '#ff9499',
];

const colours = new Map<string, string>();

function getSimilar(
    id: UserNodeId,
    similarities: Map<UserNodeId, Similarities>,
    topics?: Map<UserNodeId, string>,
    similarity?: number
) {
    const s = findSimilarUsers(id);
    similarities.set(id, {
        nodes: s,
        maxSimilarity: s[0]?.weight || 0,
        minSimilarity: s[s.length - 1]?.weight || 0,
        sumSimilarity: s.reduce((sum, v) => sum + v.weight, 0),
    });
    if (topics && similarity) {
        const profile = getUserProfile(id);
        let bestTopic = 'NOTOPIC';
        let bestTopicScore = 0;
        const maxWeight = s[0]?.weight || 0;

        profile.taste.forEach((topic) => {
            let topicScore = 0;
            let userCount = 0;
            s.forEach((user) => {
                if (user.weight >= maxWeight * (1 - similarity)) {
                    const userProfile = getUserProfile(user.id);
                    const match = userProfile.taste.find((v) => v.label === topic.label);
                    if (match) {
                        topicScore += match.weight * topic.weight * user.weight * user.weight;
                    }
                    ++userCount;
                }
            });

            topicScore /= userCount;

            if (userCount > 0 && topicScore > bestTopicScore) {
                bestTopicScore = topicScore;
                bestTopic = topic.label;
            }
        });

        if (!colours.has(bestTopic)) {
            colours.set(bestTopic, COLOURS[colours.size % COLOURS.length]);
        }

        topics.set(id, colours.get(bestTopic) || 'black');
    }
}

interface Result {
    similar: Map<UserNodeId, Similarities>;
    colours?: Map<UserNodeId, string>;
}

export function useAllSimilarUsers(users: UserNodeId[], cluster?: boolean, similarity?: number): Result {
    const simRef = useRef(new Map<UserNodeId, Similarities>());
    const topicRef = useRef(new Map<UserNodeId, string>());
    const [result, setResult] = useState<Result>({ similar: simRef.current });

    useEffect(() => {
        users.forEach((c) => {
            getSimilar(c, simRef.current, cluster ? topicRef.current : undefined, similarity);
        });
        setResult({ similar: simRef.current, colours: cluster ? topicRef.current : undefined });
    }, [users, cluster, similarity]);

    useEffect(() => {
        const handler = (id: UserNodeId) => {
            getSimilar(id, simRef.current, cluster ? topicRef.current : undefined, similarity);
            setResult({ similar: simRef.current, colours: cluster ? topicRef.current : undefined });
        };
        addAnyProfileListener(handler);
        return () => {
            removeAnyProfileListener(handler);
        };
    }, [cluster, similarity]);

    return result;
}
