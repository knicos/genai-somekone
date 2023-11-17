import { describe, it, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Feed from './Feed';
import { addContent } from '@genaism/services/content/content';
import { resetGraph } from '@genaism/services/graph/graph';

const TEST_IMAGE =
    'https://images.pexels.com/photos/3030647/pexels-photo-3030647.jpeg?cs=srgb&dl=pexels-nextvoyage-3030647.jpg&fm=jpg';

const { mockLoader, mockGenerate, mockBlob } = vi.hoisted(() => ({
    mockLoader: vi.fn(),
    mockGenerate: vi.fn(() => [['xyz']]),
    mockBlob: vi.fn(async () => {}),
}));

vi.mock('@genaism/services/loader/fileLoader', () => ({
    loadFile: mockLoader,
}));

vi.mock('@genaism/services/recommender/recommender', () => ({
    generateFeed: mockGenerate,
}));

global.fetch = vi.fn(async () => {
    return {
        status: 200,
        blob: mockBlob,
    } as unknown as Response;
});

describe('Feed component', () => {
    beforeEach(() => {
        addContent(TEST_IMAGE, { id: 'xyz', author: 'TestAuthor', labels: [] });
    });

    afterEach(() => {
        resetGraph();
    });

    it('fetches and renders a feed', async ({ expect }) => {
        render(<Feed content="http://testuri.fi" />);

        expect(await screen.findAllByTestId('feed-image-element')).toHaveLength(1);
        expect(global.fetch).toHaveBeenCalledWith('http://testuri.fi');
        await vi.waitFor(() => {
            expect(mockBlob).toHaveBeenCalled();
            expect(mockLoader).toHaveBeenCalled();
            expect(mockGenerate).toHaveBeenCalled();
        });
    });
});
