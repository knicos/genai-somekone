import EE from 'eventemitter3';
import { EdgeType, NodeID, NodeType } from './graphTypes';

const ee = new EE();

export function addNodeListener(id: string, handler: () => void) {
    ee.on(`node-${id}`, handler);
}

export function addNodeTypeListener<T extends NodeID>(type: NodeType, handler: (id: T) => void) {
    ee.on(`nodetype-${type}`, handler);
}

export function addNodeEdgeTypeListener(id: string, type: EdgeType, handler: () => void) {
    ee.on(`nodeedgetype-${id}-${type}`, handler);
}

export function addEdgeTypeListener<T extends NodeID>(type: EdgeType, handler: (id: T) => void) {
    ee.on(`edgetype-${type}`, handler);
}

export function removeNodeListener(id: string, handler: () => void) {
    ee.off(`node-${id}`, handler);
}

export function removeNodeTypeListener<T extends NodeID>(type: NodeType, handler: (id: T) => void) {
    ee.off(`nodetype-${type}`, handler);
}

export function removeNodeEdgeTypeListener(id: string, type: EdgeType, handler: () => void) {
    ee.off(`nodeedgetype-${id}-${type}`, handler);
}

export function removeEdgeTypeListener<T extends NodeID>(type: EdgeType, handler: (id: T) => void) {
    ee.off(`edgetype-${type}`, handler);
}

export function emitNodeEvent(id: string) {
    ee.emit(`node-${id}`);
}

export function emitNodeTypeEvent(type: NodeType, node: NodeID<NodeType>) {
    ee.emit(`nodetype-${type}`, node);
    emitNodeEvent(node);
}

export function emitEdgeTypeEvent(type: EdgeType, node: NodeID<NodeType>) {
    ee.emit(`edgetype-${type}`, node);
}

export function emitNodeEdgeTypeEvent(id: NodeID<NodeType>, type: EdgeType) {
    ee.emit(`nodeedgetype-${id}-${type}`);
    emitEdgeTypeEvent(type, id);
}
