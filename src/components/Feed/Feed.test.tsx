import { describe, it, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Feed from './Feed';
import TestWrapper from '@genaism/util/TestWrapper';
import { getContentService, getGraphService, getProfilerService } from '@knicos/genai-recom';

const TEST_IMAGE =
    'https://images.pexels.com/photos/3030647/pexels-photo-3030647.jpeg?cs=srgb&dl=pexels-nextvoyage-3030647.jpg&fm=jpg';

const { mockLoader, mockBlob } = vi.hoisted(() => ({
    mockLoader: vi.fn(),
    mockBlob: vi.fn(async () => new Blob()),
    mockGenerate: vi.fn(async () => {}),
}));

vi.mock('@genaism/services/loader/fileLoader', () => ({
    loadFile: mockLoader,
    getZipBlob: mockBlob,
}));

describe('Feed component', () => {
    beforeEach(() => {
        getGraphService().reset();
        getContentService().reset();
        getContentService().addContent(TEST_IMAGE, { id: 'xyz', author: 'TestAuthor', labels: [] });
        getProfilerService().reset();
        //getProfilerService().createUserProfile('user:xyz', 'NoName');
        getProfilerService().setUser('user:xyz');
    });

    it('fetches and renders a feed', async ({ expect }) => {
        render(<Feed content={['http://testuri.fi']} />, { wrapper: TestWrapper });

        expect(await screen.findAllByTestId('feed-image-element')).toHaveLength(1);
        await vi.waitFor(() => {
            expect(mockBlob).toHaveBeenCalled();
            expect(mockLoader).toHaveBeenCalled();
        });
    });
});
