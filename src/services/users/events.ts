import { UserNodeId } from '../graph/graphTypes';
import EE from 'eventemitter3';

const ee = new EE();

export function addLogListener(id: UserNodeId, handler: () => void) {
    ee.on(`log-${id}`, handler);
}

export function removeLogListener(id: UserNodeId, handler: () => void) {
    ee.off(`log-${id}`, handler);
}

export function emitLogEvent(id: UserNodeId) {
    ee.emit(`log-${id}`);
}
