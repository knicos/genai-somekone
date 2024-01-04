import { SMConfig } from '@genaism/views/Genagram/smConfig';

export const VERSION = 1;

export interface ProjectMeta {
    name: string;
    id: string;
    date: string;
    appVersion: string;
    version: number;
    origin: string;

    feedConfiguration?: SMConfig;

    dependencies: string[];
}
