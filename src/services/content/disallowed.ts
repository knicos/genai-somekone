import topics from './disallowedTopics.json';

const set = new Set(topics);

export function isDisallowedTopic(label: string) {
    return set.has(label);
}
