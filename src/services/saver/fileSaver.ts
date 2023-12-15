import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { getNodesByType } from '@genaism/services/graph/nodes';
import { getActionLog, getUserProfile } from '@genaism/services/profiler/profiler';
import { dumpJSON } from '../graph/state';

/*function transformConcepts(concepts: ConceptNode[]): ConceptEntry[] {
    const mapping = new Map<number, ConceptEntry>();
    concepts.forEach((c, ix) => {
        mapping.set(ix, {
            label: c.label,
            weight: c.weight,
            children: c.leaf ? undefined : [],
        });
    });

    const roots: ConceptEntry[] = [];

    concepts.forEach((c, ix) => {
        const self = mapping.get(ix);
        if (self) {
            if (c.parent !== undefined) {
                const parent = mapping.get(c.parent);
                if (parent?.children) {
                    parent.children.push(self);
                }
            } else {
                roots.push(self);
            }
        }
    });

    return roots;
}*/

async function generateBlob(incContent: boolean, incProfiles: boolean, incLogs: boolean, incGraph: boolean) {
    const zip = new JSZip();

    if (incContent) {
        //const imageFolder =
        zip.folder('images');

        /*if (imageFolder) {
            data.forEach((d) => {
                imageFolder.file(`${d.meta.id}.jpg`, d.image.split(';base64,')[1], { base64: true });
            });
        }

        zip.file('content.json', JSON.stringify(data.map((d) => d.meta)));

        zip.file('concepts.json', JSON.stringify(transformConcepts(concepts), undefined, 4));*/
    }

    const users = getNodesByType('user');

    if (incProfiles) {
        const profiles = users.map((u) => getUserProfile(u));
        zip.file('users.json', JSON.stringify(profiles, undefined, 4));
    }

    if (incLogs) {
        const logs = users.map((u) => ({ id: u, log: getActionLog(u) }));
        zip.file('logs.json', JSON.stringify(logs, undefined, 4));
    }

    if (incGraph) {
        zip.file('graph.json', dumpJSON());
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    return blob;
}

export async function saveFile(includeContent: boolean, includeProfiles: boolean, incLogs: boolean, incGraph: boolean) {
    const blob = await generateBlob(includeContent, includeProfiles, incLogs, incGraph);
    saveAs(blob, 'somekone.zip');
    return blob;
}
