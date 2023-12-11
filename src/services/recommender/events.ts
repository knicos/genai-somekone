import EE from 'eventemitter3';
import { UserNodeId } from '../graph/graphTypes';
import { ScoredRecommendation } from './recommenderTypes';

const ee = new EE();

export function addRecommendationListener(id: UserNodeId, handler: (results: ScoredRecommendation[]) => void) {
    ee.on(`recom-${id}`, handler);
}

export function removeRecommendationListener(id: UserNodeId, handler: (results: ScoredRecommendation[]) => void) {
    ee.off(`recom-${id}`, handler);
}

export function emitRecommendationEvent(id: UserNodeId, results: ScoredRecommendation[]) {
    ee.emit(`recom-${id}`, results);
}
