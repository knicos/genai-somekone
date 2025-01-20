import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { getResearchLog } from '../research/research';
import { ProjectMeta, VERSION } from './types';
import { v4 as uuidv4 } from 'uuid';
import appVersion from '@genaism/generatedGitInfo.json';
import { SMConfig } from '@genaism/state/smConfig';
import { dependencies } from '../loader/tracker';
import { SomekoneSettings } from '@genaism/hooks/settings';
import { ActionLogService, ContentService, ProfilerService } from '@knicos/genai-recom';

function makeMeta(configuration?: SMConfig, name?: string, hasLow?: boolean): ProjectMeta {
    return {
        date: new Date().toISOString(),
        name: name || 'NoName',
        version: VERSION,
        appVersion: appVersion.gitTag || 'notag',
        dependencies: Array.from(dependencies),
        id: uuidv4(),
        feedConfiguration: configuration,
        origin: window.location.origin,
        hasLowResolution: hasLow,
    };
}

interface GenerateOptions {
    includeContent?: boolean;
    includeProfiles?: boolean;
    includeLogs?: boolean;
    includeGraph?: boolean;
    configuration?: SMConfig;
    name?: string;
    settings?: SomekoneSettings;
}

async function generateBlob(
    profilerSvc: ProfilerService,
    contentSvc: ContentService,
    loggerSvc: ActionLogService,
    { includeContent, includeProfiles, includeLogs, includeGraph, configuration, settings }: GenerateOptions
) {
    const zip = new JSZip();

    let hasLow = false;

    if (includeContent) {
        const imageFolder = zip.folder('images');
        let count = 0;

        if (imageFolder) {
            const content = contentSvc.graph.getNodesByType('content');
            content.forEach((d) => {
                const data = contentSvc.getContentData(d);
                if (data && !data.startsWith('http')) {
                    imageFolder.file(`${d.split(':')[1]}.jpg`, data.split(';base64,')[1], { base64: true });
                    ++count;
                }
                const ldata = contentSvc.getContentData(d, true);
                if (ldata && ldata !== data && !ldata.startsWith('http')) {
                    imageFolder.file(`${d.split(':')[1]}_low.jpg`, ldata.split(';base64,')[1], { base64: true });
                    ++count;
                }
                if (ldata && ldata !== data) {
                    hasLow = true;
                }
            });

            const meta = content.map((c) => contentSvc.getContentMetadata(c));
            zip.file('content.json', JSON.stringify(meta, undefined, 4));
        }

        if (count === 0) {
            zip.remove('images');
        }
    }

    const users = profilerSvc.graph.getNodesByType('user');

    if (includeProfiles) {
        const profiles = users.map((u) => profilerSvc.getUserProfile(u));
        zip.file('users.json', JSON.stringify(profiles, undefined, 4));
    }

    if (includeLogs) {
        const logs = users.map((u) => ({ id: u, log: loggerSvc.getActionLog(u) }));
        zip.file('logs.json', JSON.stringify(logs, undefined, 4));
    }

    if (includeGraph) {
        zip.file('graph.json', profilerSvc.graph.dumpJSON());
    }

    if (settings) {
        zip.file('settings.json', JSON.stringify(settings, undefined, 4));
    }

    zip.file('metadata.json', JSON.stringify(makeMeta(configuration, undefined, hasLow), undefined, 4));

    const researchLog = getResearchLog();
    if (researchLog.length > 0) {
        zip.file('research.json', JSON.stringify(researchLog, undefined, 4));
        zip.file('comments.json', JSON.stringify(contentSvc.dumpComments(), undefined, 4));
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    return blob;
}

export async function saveFile(
    profilerSvc: ProfilerService,
    contentSvc: ContentService,
    loggerSvc: ActionLogService,
    opts?: GenerateOptions
) {
    const blob = await generateBlob(profilerSvc, contentSvc, loggerSvc, opts || {});
    saveAs(blob, 'somekone.zip');
    return blob;
}
