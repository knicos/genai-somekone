import { describe, it, vi } from 'vitest';
import JSZip from 'jszip';
import { GuidanceData, loadGuide } from './guidance';

const { getZip } = vi.hoisted(() => ({
    getZip: vi.fn(),
}));

vi.mock('@knicos/genai-base/util/zip', () => ({
    getZipBlob: getZip,
}));

describe('loadGuide()', () => {
    it('loads an empty guide zip', async ({ expect }) => {
        const zip = new JSZip();
        const fakeGuide: GuidanceData = {
            name: 'fake',
            locales: ['en-GB'],
            steps: [],
        };
        zip.file('guide.json', JSON.stringify(fakeGuide));
        zip.file('locale/en-GB.json', '{}');

        const blob = await zip.generateAsync({ type: 'blob' });

        getZip.mockImplementationOnce(async () => blob);
        const guide = await loadGuide('https://something');

        expect(guide).toBeTruthy();
        expect(guide.name).toBe('fake');
    });

    it('patches by locale', async ({ expect }) => {
        const zip = new JSZip();
        const fakeGuide: GuidanceData = {
            name: 'fake',
            locales: ['en-GB'],
            steps: [
                {
                    title: 'title1',
                },
            ],
        };
        zip.file('guide.json', JSON.stringify(fakeGuide));
        zip.file('locale/en-GB.json', '{"title1": "test title"}');

        const blob = await zip.generateAsync({ type: 'blob' });

        getZip.mockImplementationOnce(async () => blob);
        const guide = await loadGuide('https://something');

        expect(guide).toBeTruthy();
        expect(guide.steps).toHaveLength(1);
        expect(guide.steps[0].title).toBe('test title');
    });
});
