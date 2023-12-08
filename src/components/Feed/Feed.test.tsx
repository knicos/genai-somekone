import { describe, it, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Feed from './Feed';
import { addContent } from '@genaism/services/content/content';
import { resetGraph } from '@genaism/services/graph/graph';

const TEST_IMAGE =
    'https://images.pexels.com/photos/3030647/pexels-photo-3030647.jpeg?cs=srgb&dl=pexels-nextvoyage-3030647.jpg&fm=jpg';

const { mockLoader, mockGenerate, mockBlob } = vi.hoisted(() => ({
    mockLoader: vi.fn(),
    mockGenerate: vi.fn(() => [[{ contentId: 'xyz' }]]),
    mockBlob: vi.fn(async () => new Blob()),
}));

vi.mock('@genaism/services/loader/fileLoader', () => ({
    loadFile: mockLoader,
    getZipBlob: mockBlob,
}));

vi.mock('@genaism/services/recommender/recommender', () => ({
    generateFeed: mockGenerate,
}));

describe('Feed component', () => {
    beforeEach(() => {
        addContent(TEST_IMAGE, { id: 'xyz', author: 'TestAuthor', labels: [] });
    });

    afterEach(() => {
        resetGraph();
    });

    it('fetches and renders a feed', async ({ expect }) => {
        render(<Feed content={['http://testuri.fi']} />);

        expect(await screen.findAllByTestId('feed-image-element')).toHaveLength(1);
        await vi.waitFor(() => {
            expect(mockBlob).toHaveBeenCalled();
            expect(mockLoader).toHaveBeenCalled();
            expect(mockGenerate).toHaveBeenCalled();
        });
    });
});
