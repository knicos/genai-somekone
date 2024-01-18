import { WeightedLabel } from '@genaism/services/content/contentTypes';
import { UserNodeId, WeightedNode } from '@genaism/services/graph/graphTypes';
import { addAnyProfileListener, removeAnyProfileListener } from '@genaism/services/profiler/events';
import { getUserProfile } from '@genaism/services/profiler/profiler';
import { findSimilarUsers } from '@genaism/services/users/users';
import { useEffect, useRef, useState } from 'react';
import { isDisallowedTopic } from './disallowed';

export interface Similarities {
    nodes: WeightedNode<UserNodeId>[];
    maxSimilarity: number;
    minSimilarity: number;
    sumSimilarity: number;
}

function getSimilar(
    id: UserNodeId,
    similarities: Map<UserNodeId, Similarities>,
    topics?: Map<UserNodeId, WeightedLabel[]>,
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
        //let bestTopic = 'NOTOPIC';
        //let bestTopicScore = 0;
        const maxUserWeight = s[0]?.weight || 0;

        const bestTopics: WeightedLabel[] = [];

        if (profile.taste.length > 0) {
            const myMax = profile.taste[0].weight;
            profile.taste.forEach((topic) => {
                if (!isDisallowedTopic(topic.label)) {
                    const normTopic = topic.weight / myMax;
                    let topicScore = 0;
                    let userCount = 0;
                    s.forEach((user) => {
                        //if (user.weight >= maxUserWeight * (1 - similarity)) {
                        // Normalize against the max of the user.
                        // Invert and check the squared difference
                        // Best topic becomes the ones that produce the minimum squared difference.
                        const userProfile = getUserProfile(user.id);
                        if (userProfile.taste.length > 0) {
                            const similarMax = userProfile.taste[0].weight;
                            const match = userProfile.taste.find((v) => v.label === topic.label);
                            if (match) {
                                const normMatch = match.weight / similarMax;
                                const diff = normMatch - normTopic;
                                const normUserWeight = user.weight / maxUserWeight;
                                topicScore += (1 - diff * diff) * normUserWeight;
                            }
                            ++userCount;
                        }
                        //}
                    });

                    topicScore /= userCount;

                    //console.log('TOPIC', profile.name, topic.label, topicScore);
                    bestTopics.push({ label: topic.label, weight: topicScore });

                    /*if (userCount > 0 && topicScore > bestTopicScore) {
                    bestTopicScore = topicScore;
                    bestTopic = topic.label;
                }*/
                }
            });
        }

        /*if (!colours.has(bestTopic)) {
            colours.set(bestTopic, COLOURS[colours.size % COLOURS.length]);
        }

        topics.set(id, colours.get(bestTopic) || 'black');*/

        bestTopics.sort((a, b) => b.weight - a.weight);
        topics.set(id, bestTopics);
    }
}

interface Result {
    similar: Map<UserNodeId, Similarities>;
    topics?: Map<UserNodeId, WeightedLabel[]>;
}

export function useAllSimilarUsers(users: UserNodeId[], cluster?: boolean, similarity?: number): Result {
    const simRef = useRef(new Map<UserNodeId, Similarities>());
    const topicRef = useRef(new Map<UserNodeId, WeightedLabel[]>());
    const [result, setResult] = useState<Result>({ similar: simRef.current });

    useEffect(() => {
        users.forEach((c) => {
            getSimilar(c, simRef.current, cluster ? topicRef.current : undefined, similarity);
        });
        setResult({ similar: simRef.current, topics: cluster ? topicRef.current : undefined });
    }, [users, cluster, similarity]);

    useEffect(() => {
        const handler = (id: UserNodeId) => {
            getSimilar(id, simRef.current, cluster ? topicRef.current : undefined, similarity);
            setResult({ similar: simRef.current, topics: cluster ? topicRef.current : undefined });
        };
        addAnyProfileListener(handler);
        return () => {
            removeAnyProfileListener(handler);
        };
    }, [cluster, similarity]);

    return result;
}
