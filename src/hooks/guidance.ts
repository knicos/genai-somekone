import JSZip from 'jszip';
import { getZipBlob } from '@knicos/genai-base/util/zip';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

import { SomekoneSettings } from '@genaism/hooks/settings';

export type GuidanceAction = 'pause' | 'sharecode' | 'download';

export interface GuideAction extends SomekoneSettings {
    url?: string;
    replay?: boolean;
    autoPlay?: number;
}

export interface GuidanceStep {
    title?: string;
    actions: string[];
    actionButton?: GuidanceAction;
    next?: number;
}

export interface GuidanceData {
    name: string;
    locales: string[];
    actions: Record<string, GuideAction>;
    steps: GuidanceStep[];
    firstStep?: number;
    initActions?: string[];
    reloadOnReplayEnd?: boolean;
}

const DEFAULT_LOCALE = 'en';

const KNOWN_GUIDES: Record<string, string> = {
    default: 'https://store.gen-ai.fi/somekone/guides/guide1_update2.zip',
    kiosk: 'https://store.gen-ai.fi/somekone/guides/kiosk1.zip',
};

export async function loadGuide(url: string, locale = DEFAULT_LOCALE) {
    const realURL = url.startsWith('http') ? url : KNOWN_GUIDES[url];
    if (!realURL) throw new Error('invalid_guide');

    const blob = await getZipBlob(realURL);
    const zip = await JSZip.loadAsync(blob);
    const guide = zip.file('guide.json');
    if (!guide) {
        throw new Error('invalid_guide_zip');
    }

    const guideData = JSON.parse(await guide.async('string')) as GuidanceData;

    if (!guideData.locales.includes(locale)) {
        locale = DEFAULT_LOCALE;
    }

    const localeFile = zip.file(`locale/${locale}.json`);
    if (!localeFile) {
        throw new Error('missing_guide_locale');
    }

    const localeData = JSON.parse(await localeFile.async('string')) as Record<string, string>;

    // Patch with the locale.
    guideData.steps.forEach((step) => {
        if (step.title) {
            step.title = localeData[step.title];
        }
    });

    return guideData;
}

export function useGuide(url: string) {
    const { i18n } = useTranslation();
    const locale = i18n.language;
    const [guide, setGuide] = useState<GuidanceData | null>(null);

    useEffect(() => {
        loadGuide(url, i18n.language)
            .then(setGuide)
            .catch((e) => {
                console.error('Guide error', url, e);
                setGuide(null);
            });
    }, [url, locale, i18n]);

    return guide;
}
