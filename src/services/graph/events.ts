import EE from 'eventemitter3';
import { EdgeType, NodeType } from './graphTypes';

const ee = new EE();

export function addNodeListener(id: string, handler: () => void) {
    ee.on(`node-${id}`, handler);
}

export function addNodeTypeListener(type: NodeType, handler: (id: string) => void) {
    ee.on(`nodetype-${type}`, handler);
}

export function addNodeEdgeTypeListener(id: string, type: EdgeType, handler: () => void) {
    ee.on(`nodeedgetype-${id}-${type}`, handler);
}

export function addEdgeTypeListener(type: EdgeType, handler: (id: string) => void) {
    ee.on(`edgetype-${type}`, handler);
}

export function removeNodeListener(id: string, handler: () => void) {
    ee.off(`node-${id}`, handler);
}

export function removeNodeTypeListener(type: NodeType, handler: (id: string) => void) {
    ee.off(`nodetype-${type}`, handler);
}

export function removeNodeEdgeTypeListener(id: string, type: EdgeType, handler: () => void) {
    ee.off(`nodeedgetype-${id}-${type}`, handler);
}

export function removeEdgeTypeListener(type: EdgeType, handler: (id: string) => void) {
    ee.off(`edgetype-${type}`, handler);
}

export function emitNodeEvent(id: string) {
    ee.emit(`node-${id}`);
}

export function emitNodeTypeEvent(type: NodeType, node: string) {
    ee.emit(`nodetype-${type}`, node);
    emitNodeEvent(node);
}

export function emitEdgeTypeEvent(type: EdgeType, node: string) {
    ee.emit(`edgetype-${type}`, node);
}

export function emitNodeEdgeTypeEvent(id: string, type: EdgeType) {
    ee.emit(`nodeedgetype-${id}-${type}`);
    emitEdgeTypeEvent(type, id);
}
