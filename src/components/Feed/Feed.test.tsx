import { describe, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Feed from './Feed';
import TestWrapper from '@genaism/util/TestWrapper';
import { getContentService, getGraphService, getProfilerService } from '@knicos/genai-recom';

const TEST_IMAGE =
    'https://images.pexels.com/photos/3030647/pexels-photo-3030647.jpeg?cs=srgb&dl=pexels-nextvoyage-3030647.jpg&fm=jpg';

describe('Feed component', () => {
    beforeEach(() => {
        getGraphService().reset();
        getContentService().reset();
        getContentService().addContent(TEST_IMAGE, { id: 'xyz', author: 'TestAuthor', labels: [] });
        getProfilerService().reset();
        //getProfilerService().createUserProfile('user:xyz', 'NoName');
        getProfilerService().setUser('user:xyz');
    });

    it('renders a feed', async ({ expect }) => {
        render(<Feed />, { wrapper: TestWrapper });

        expect(await screen.findAllByTestId('feed-image-element')).toHaveLength(1);
    });
});
