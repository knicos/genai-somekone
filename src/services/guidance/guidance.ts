import { GuidanceData } from './guidanceTypes';
import defaultGuide from './defaultGuidance.json';

const store = new Map<string, GuidanceData>();

export function addGuidance(name: string, data: GuidanceData) {
    store.set(name, data);
}

export function getGuidance(name: string): GuidanceData | null {
    return store.get(name) || null;
}

addGuidance('default', defaultGuide as GuidanceData);
