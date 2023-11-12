import { getNodesByType, getRelated } from '../graph/graph';
import { getTasteProfile } from '../profiler/profiler';
import { getTopicLabel } from '../concept/concept';

const factors = new Map<string, number>();

function calculateCount(high: number, low: number, value: number, max: number) {
    return ((value - low) / (high - low)) * (max - 1) + 1;
}

function generateTasteBatch(nodes: string[], count: number) {
    const taste = getTasteProfile(10);

    const high = taste[0]?.weight || 0;
    const low = taste[taste.length - 1]?.weight || 0;

    taste.forEach((t) => {
        if (t.weight > 0) {
            const c = calculateCount(high, low, t.weight, count);
            const tresult = getRelated('content', t.id, c, factors);
            console.log('Topic', getTopicLabel(t.id), c, tresult);
            tresult.forEach((tr) => nodes.push(tr.id));
        }
    });
}

function fillWithRandom(nodes: string[], count: number) {
    const allNodes = getNodesByType('content');
    console.log('NODE SIZE', allNodes.length);
    if (allNodes.length === 0) return;

    while (nodes.length < count) {
        const ix = Math.floor(Math.random() * allNodes.length);
        nodes.push(allNodes[ix]);
    }

    console.log('Final node size', nodes.length);
}

export function generateFeed(count: number): string[] {
    // For each candidate strategy, generate a number of condidates based upon affinity
    // Repeat until there are enough candidates
    // Randomly select from the candidates

    //const nodes = getRelated('content', getTopicId('animal'), count, factors);
    const nodes: string[] = [];
    generateTasteBatch(nodes, count * 2);
    fillWithRandom(nodes, count);

    const nodeArray = nodes;

    if (nodeArray.length < count) return nodeArray;

    // TODO: Score the results by how much they match profile
    // Or by how they match past engagements of each type.
    // but each image would need a lot of labels for this to work directly

    const selected = new Set<string>();
    // FIXME: Can loop infinitely.
    while (selected.size < count) {
        const ix = Math.floor(Math.random() * nodeArray.length);
        selected.add(nodeArray[ix]);
    }

    const final = Array.from(selected);

    // Update the factors
    final.forEach((n) => {
        factors.set(n, (factors.get(n) || 1) * 0.9);
    });

    //console.log('FACTORS', factors);

    return final;
}
