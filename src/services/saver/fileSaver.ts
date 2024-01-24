import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { getNodesByType } from '@genaism/services/graph/nodes';
import { getActionLog, getUserProfile } from '@genaism/services/profiler/profiler';
import { dumpJSON } from '../graph/state';
import { getResearchLog } from '../research/research';
import { dumpComments, getContentData, getContentMetadata } from '../content/content';
import { ProjectMeta, VERSION } from './types';
import { v4 as uuidv4 } from 'uuid';
import appVersion from '@genaism/generatedGitInfo.json';
import { SMConfig } from '@genaism/views/Genagram/smConfig';
import { dependencies } from '../loader/tracker';

function makeMeta(configuration?: SMConfig, name?: string): ProjectMeta {
    return {
        date: new Date().toISOString(),
        name: name || 'NoName',
        version: VERSION,
        appVersion: appVersion.gitTag || 'notag',
        dependencies: Array.from(dependencies),
        id: uuidv4(),
        feedConfiguration: configuration,
        origin: window.location.origin,
    };
}

interface GenerateOptions {
    includeContent?: boolean;
    includeProfiles?: boolean;
    includeLogs?: boolean;
    includeGraph?: boolean;
    configuration?: SMConfig;
    name?: string;
}

async function generateBlob({
    includeContent,
    includeProfiles,
    includeLogs,
    includeGraph,
    configuration,
}: GenerateOptions) {
    const zip = new JSZip();

    if (includeContent) {
        const imageFolder = zip.folder('images');

        if (imageFolder) {
            const content = getNodesByType('content');
            content.forEach((d) => {
                const data = getContentData(d);
                if (data) {
                    imageFolder.file(`${d.split(':')[1]}.jpg`, data.split(';base64,')[1], { base64: true });
                }
            });

            const meta = content.map((c) => getContentMetadata(c));
            zip.file('content.json', JSON.stringify(meta, undefined, 4));
        }
    }

    const users = getNodesByType('user');

    if (includeProfiles) {
        const profiles = users.map((u) => getUserProfile(u));
        zip.file('users.json', JSON.stringify(profiles, undefined, 4));
    }

    if (includeLogs) {
        const logs = users.map((u) => ({ id: u, log: getActionLog(u) }));
        zip.file('logs.json', JSON.stringify(logs, undefined, 4));
    }

    if (includeGraph) {
        zip.file('graph.json', dumpJSON());
    }

    zip.file('metadata.json', JSON.stringify(makeMeta(configuration), undefined, 4));

    const researchLog = getResearchLog();
    if (researchLog.length > 0) {
        zip.file('research.json', JSON.stringify(researchLog, undefined, 4));
        zip.file('comments.json', JSON.stringify(dumpComments(), undefined, 4));
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    return blob;
}

export async function saveFile(opts?: GenerateOptions) {
    const blob = await generateBlob(opts || {});
    saveAs(blob, 'somekone.zip');
    return blob;
}
