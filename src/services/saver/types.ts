import { SMConfig } from '@genaism/state/smConfig';

export const VERSION = 1;

export interface ProjectMeta {
    name: string;
    id: string;
    date: string;
    appVersion: string;
    version: number;
    origin: string;

    feedConfiguration?: SMConfig;
    encoderURL?: string;

    dependencies: string[];

    labelLocale?: Record<string, Record<string, string>>;
}
