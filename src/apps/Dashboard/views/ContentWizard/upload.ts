import { canvasFromFile } from '@genai-fi/base';
import { anonUsername, ContentMetadata, ContentService } from '@genai-fi/recom';

export default async function uploadImages(contentSvc: ContentService, files: File[]) {
    files.forEach((file) => {
        const fullName = file.name.split(/[\\/]+/i).pop() || file.name;
        const name = fullName.split('.')[0];
        const meta: ContentMetadata = {
            id: name,
            labels: [],
            author: anonUsername(),
        };

        canvasFromFile(file, 500).then((canvas) => {
            const imageData = canvas.toDataURL('image/jpeg', 0.95);
            contentSvc.addContent(imageData, meta);
        });
    });
}
