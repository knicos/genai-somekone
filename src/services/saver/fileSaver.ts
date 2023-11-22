import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { getNodesByType } from '@genaism/services/graph/nodes';
import { getUserProfile } from '@genaism/services/profiler/profiler';

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

async function generateBlob(incContent: boolean, incProfiles: boolean) {
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

    if (incProfiles) {
        const users = getNodesByType('user');
        const profiles = users.map((u) => getUserProfile(u));
        zip.file('users.json', JSON.stringify(profiles, undefined, 4));
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    return blob;
}

export async function saveFile(includeContent: boolean, includeProfiles: boolean) {
    const blob = await generateBlob(includeContent, includeProfiles);
    saveAs(blob, 'genagram.zip');
    return blob;
}
