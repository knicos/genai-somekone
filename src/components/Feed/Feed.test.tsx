import { describe, it, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Feed from './Feed';
import { addContent } from '@genaism/services/content/content';
import { resetGraph } from '@genaism/services/graph/graph';
import TestWrapper from '@genaism/util/TestWrapper';

const TEST_IMAGE =
    'https://images.pexels.com/photos/3030647/pexels-photo-3030647.jpeg?cs=srgb&dl=pexels-nextvoyage-3030647.jpg&fm=jpg';

const { mockLoader, mockRecom, mockGenerate, mockBlob } = vi.hoisted(() => ({
    mockLoader: vi.fn(),
    mockRecom: vi.fn(() => [{ contentId: 'content:xyz' }]),
    mockBlob: vi.fn(async () => new Blob()),
    mockGenerate: vi.fn(async () => {}),
}));

vi.mock('@genaism/services/loader/fileLoader', () => ({
    loadFile: mockLoader,
    getZipBlob: mockBlob,
}));

vi.mock('@genaism/services/recommender/recommender', () => ({
    getRecommendations: mockRecom,
    generateNewRecommendations: mockGenerate,
}));

describe('Feed component', () => {
    beforeEach(() => {
        addContent(TEST_IMAGE, { id: 'xyz', author: 'TestAuthor', labels: [] });
    });

    afterEach(() => {
        resetGraph();
    });

    it('fetches and renders a feed', async ({ expect }) => {
        render(<Feed content={['http://testuri.fi']} />, { wrapper: TestWrapper });

        expect(await screen.findAllByTestId('feed-image-element')).toHaveLength(1);
        await vi.waitFor(() => {
            expect(mockBlob).toHaveBeenCalled();
            expect(mockLoader).toHaveBeenCalled();
            expect(mockRecom).toHaveBeenCalled();
        });
    });
});
