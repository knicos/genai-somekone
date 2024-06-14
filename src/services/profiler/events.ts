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
    emitAnyProfileEvent(id);
}

export function addAnyProfileListener(handler: (id: UserNodeId) => void) {
    ee.on(`profile`, handler);
}

export function removeAnyProfileListener(handler: (id: UserNodeId) => void) {
    ee.off(`profile`, handler);
}

export function emitAnyProfileEvent(id: UserNodeId) {
    ee.emit(`profile`, id);
}
