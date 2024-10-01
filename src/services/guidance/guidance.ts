import { GuidanceData } from './guidanceTypes';
import defaultGuide from './defaultGuidance.json';
import i18n from '@genaism/i18n';

const DEFAULT_LOCALE = 'en-GB';

const store = new Map<string, GuidanceData>();

export function addGuidance(name: string, locale: string, data: GuidanceData) {
    store.set(`${name}::${locale}`, data);
}

export function getGuidance(name: string, locale?: string): GuidanceData | null {
    const l = locale || i18n.language;
    const g1 = store.get(`${name}::${l}`);
    if (g1) return g1;
    const g2 = store.get(`${name}::${DEFAULT_LOCALE}`);
    return g2 || null;
}

defaultGuide.forEach((guide) => {
    addGuidance(guide.name, guide.locale, guide as GuidanceData);
});
