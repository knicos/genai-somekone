import { UserNodeId } from '../graph/graphTypes';
import EE from 'eventemitter3';
import { LogActivity, LogEntry } from './userTypes';

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

export function addLogDataListener(type: LogActivity, handler: (id: UserNodeId, log: LogEntry) => void) {
    ee.on(`logdata-${type}`, handler);
}

export function removeLogDataListener(type: LogActivity, handler: (id: UserNodeId, log: LogEntry) => void) {
    ee.off(`logdata-${type}`, handler);
}

export function emitLogDataEvent(id: UserNodeId, log: LogEntry) {
    ee.emit(`logdata-${log.activity}`, id, log);
}
