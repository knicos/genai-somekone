import EE from 'eventemitter3';
import { EdgeType, NodeType } from './graphTypes';

const ee = new EE();

export function addNodeListener(id: string, handler: () => void) {
    ee.on(`node-${id}`, handler);
}

export function addNodeTypeListener(type: NodeType, handler: () => void) {
    ee.on(`nodetype-${type}`, handler);
}

export function addEdgeTypeListener(id: string, type: EdgeType, handler: () => void) {
    ee.on(`edgetype-${id}-${type}`, handler);
}

export function removeNodeListener(id: string, handler: () => void) {
    ee.off(`node-${id}`, handler);
}

export function removeNodeTypeListener(type: NodeType, handler: () => void) {
    ee.off(`nodetype-${type}`, handler);
}

export function removeEdgeTypeListener(id: string, type: EdgeType, handler: () => void) {
    ee.off(`edgetype-${id}-${type}`, handler);
}

export function emitNodeEvent(id: string) {
    ee.emit(`node-${id}`);
}

export function emitNodeTypeEvent(type: NodeType) {
    ee.emit(`nodetype-${type}`);
}

export function emitEdgeTypeEvent(id: string, type: EdgeType) {
    ee.emit(`edgetype-${id}-${type}`);
}
