import { SomekoneSettings } from '@genaism/hooks/settings';

export type GuidanceAction = 'pause' | 'sharecode';

export interface GuidanceStep {
    settings?: SomekoneSettings;
    title: string;
    action?: GuidanceAction;
}

export interface GuidanceData {
    name: string;
    steps: GuidanceStep[];
}
