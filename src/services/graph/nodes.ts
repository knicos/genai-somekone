import { emitNodeTypeEvent } from './events';
import { NodeID, NodeType } from './graphTypes';
import { edgeSrcIndex, edgeStore, edgeTypeSrcIndex, nodeStore, nodeTypeIndex } from './state';
import { v4 as uuidv4 } from 'uuid';

export function removeNode<T extends NodeType>(id: NodeID<T>) {
    // Remove all edges first.
    const edges = edgeSrcIndex.get(id);
    if (edges) {
        edges.forEach((edge) => {
            const id = `${edge.destination}:${edge.type}:${edge.source}`;
            const srctypeid = `${edge.type}:${edge.source}`;
            edgeStore.delete(id);
            edgeSrcIndex.delete(edge.source);
            edgeTypeSrcIndex.delete(srctypeid);
        });
    }

    const node = nodeStore.get(id);
    if (node) {
        const typeIndex = nodeTypeIndex.get(node.type);
        nodeTypeIndex.set(
            node.type,
            (typeIndex || []).filter((f) => f.id !== id)
        );
        nodeStore.delete(id);

        emitNodeTypeEvent(node.type, id);
    }
}

export function addNode<T extends NodeType>(type: T, id?: NodeID<T>): NodeID<T> {
    const nid = id ? id : (`${type}:${uuidv4()}` as NodeID<T>);
    if (nodeStore.has(nid)) throw new Error('id_exists');
    const node = { type, id: nid };
    nodeStore.set(nid, node);
    if (!nodeTypeIndex.has(type)) {
        nodeTypeIndex.set(type, []);
    }
    const typeArray = nodeTypeIndex.get(type);
    if (typeArray) typeArray.push(node);

    emitNodeTypeEvent(type, nid);

    return nid;
}

export function addNodeIfNotExists<T extends NodeType>(type: T, id: NodeID<T>): NodeID<T> | undefined {
    const nid = id;
    if (nodeStore.has(nid)) return;
    const node = { type, id: nid };
    nodeStore.set(nid, node);
    if (!nodeTypeIndex.has(type)) {
        nodeTypeIndex.set(type, []);
    }
    const typeArray = nodeTypeIndex.get(type);
    if (typeArray) typeArray.push(node);

    emitNodeTypeEvent(type, nid);

    return nid;
}

export function getNodeType(id: string): NodeType | null {
    const n = nodeStore.get(id);
    return n ? n.type : null;
}

export function getNodesByType<T extends NodeType>(type: T): NodeID<T>[] {
    const nt = nodeTypeIndex.get(type);
    return (nt ? nt.map((n) => n.id) : []) as NodeID<T>[];
}

const globalNode: NodeID<'special'> = 'special:root';
addNodeIfNotExists('special', 'special:root');

export function getRootNode() {
    return globalNode;
}
