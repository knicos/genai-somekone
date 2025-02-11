import { UserNodeId, WeightedNode } from '@knicos/genai-recom';
import { GraphLink } from '../common/visualisations/Graph/types';

export function generateLinks(
    similar: Map<UserNodeId, WeightedNode<UserNodeId>[]>,
    allLinks: boolean,
    similarPercent: number,
    maxLinks: number
) {
    const newLinks: GraphLink<UserNodeId, UserNodeId>[] = [];
    let globalMin = 1;
    similar.forEach((s) => {
        globalMin = Math.min(globalMin, s[0]?.weight || 1);
    });
    globalMin = globalMin * (1 - similarPercent);

    similar.forEach((s, id) => {
        const maxWeight = s[0]?.weight || 0;
        let count = 0;
        s.some((node) => {
            if (allLinks || (node.weight >= maxWeight * (1 - similarPercent) && count < maxLinks)) {
                const astrength = Math.max(0, (node.weight - globalMin) / (1 - globalMin));
                newLinks.push({
                    source: id,
                    target: node.id,
                    strength: node.weight >= maxWeight * (1 - similarPercent) ? astrength : 0,
                    actualStrength: astrength,
                });
                ++count;
                return false;
            } else {
                return true;
            }
        });
    });

    return newLinks;
}

/*export function isFullyConnected(links: GraphLink<UserNodeId, UserNodeId>[]) {
    if (links.length === 0) return true;
    const nodeLinks = new Map<UserNodeId, UserNodeId[]>();
    links.forEach((link) => {
        const s = nodeLinks.get(link.source) || [];
        s.push(link.target);
        nodeLinks.set(link.source, s);

        const t = nodeLinks.get(link.target) || [];
        t.push(link.source);
        nodeLinks.set(link.target, t);
    });

    const visited = new Set<UserNodeId>();
    const todo: UserNodeId[] = [];

    todo.push(links[0].source);

    while (todo.length > 0) {
        const cur = todo.pop();
        if (cur) {
            const next = nodeLinks.get(cur) || [];
            const nonVisited = next.filter((n) => {
                const result = !visited.has(n);
                if (result) visited.add(n);
                return result;
            });

            if (nonVisited.length > 0) {
                todo.push(...nonVisited);
            }
        }
    }

    return visited.size === nodeLinks.size;
}*/
