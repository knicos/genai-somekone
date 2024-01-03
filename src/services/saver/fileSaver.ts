import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { getNodesByType } from '@genaism/services/graph/nodes';
import { getActionLog, getUserProfile } from '@genaism/services/profiler/profiler';
import { dumpJSON } from '../graph/state';
import { getResearchLog } from '../research/research';
import { getContentData, getContentMetadata } from '../content/content';

interface GenerateOptions {
    includeContent?: boolean;
    includeProfiles?: boolean;
    includeLogs?: boolean;
    includeGraph?: boolean;
}

async function generateBlob({ includeContent, includeProfiles, includeLogs, includeGraph }: GenerateOptions) {
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

    const researchLog = getResearchLog();
    if (researchLog.length > 0) {
        zip.file('research.json', JSON.stringify(researchLog, undefined, 4));
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    return blob;
}

export async function saveFile(opts?: GenerateOptions) {
    const blob = await generateBlob(opts || {});
    saveAs(blob, 'somekone.zip');
    return blob;
}
