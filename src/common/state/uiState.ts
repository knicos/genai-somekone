import { atom } from 'jotai';

export const uiDarkMode = atom<boolean>(false);

interface FeatureFlags {
    allowReportProblem?: boolean;
}

export const featureFlagsAtom = atom(async () => {
    try {
        const isStagingEnv = !window.location.hostname.endsWith('gen-ai.fi');
        const response = await fetch(
            `${import.meta.env.VITE_APP_API}/features/${isStagingEnv ? 'somekone-staging' : 'somekone'}`
        );
        const data: { features: FeatureFlags } = await response.json();
        return data.features;
    } catch {
        return {
            allowReportProblem: true,
        };
    }
});
