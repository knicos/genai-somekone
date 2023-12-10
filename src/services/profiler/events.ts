import EE from 'eventemitter3';
import { UserNodeId } from '../graph/graphTypes';

const ee = new EE();

export function addProfileListener(id: UserNodeId, handler: () => void) {
    ee.on(`profile-${id}`, handler);
}

export function removeProfileListener(id: UserNodeId, handler: () => void) {
    ee.off(`profile-${id}`, handler);
}

export function emitProfileEvent(id: UserNodeId) {
    ee.emit(`profile-${id}`);
}

export function addLogListener(id: UserNodeId, handler: () => void) {
    ee.on(`log-${id}`, handler);
}

export function removeLogListener(id: UserNodeId, handler: () => void) {
    ee.off(`log-${id}`, handler);
}

export function emitLogEvent(id: UserNodeId) {
    ee.emit(`log-${id}`);
}
