import { SomekoneSettings } from '@genaism/hooks/settings';

export type GuidanceAction = 'pause' | 'sharecode';

export interface GuidanceStep {
    settings?: SomekoneSettings;
    url?: string;
    title: string;
    action?: GuidanceAction;
}

export interface GuidanceData {
    name: string;
    locale: string;
    steps: GuidanceStep[];
}
