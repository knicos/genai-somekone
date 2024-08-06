import { describe, it, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ImageFeed from './ImageFeed';
import userEvent from '@testing-library/user-event';
import { ContentNodeId, getContentService, getGraphService, ScoredRecommendation } from '@knicos/genai-recom';

function makeRecommendation(id: ContentNodeId): ScoredRecommendation {
    return {
        contentId: id,
        score: 0,
        scores: {},
        significance: {},
        features: {},
        rank: 0,
        diversity: 0,
        timestamp: 0,
        candidateOrigin: 'random',
    };
}

const TEST_IMAGE =
    'https://images.pexels.com/photos/3030647/pexels-photo-3030647.jpeg?cs=srgb&dl=pexels-nextvoyage-3030647.jpg&fm=jpg';

describe('ImageFeed component', () => {
    beforeEach(() => {
        getGraphService().reset();
        getContentService().addContent(TEST_IMAGE, { id: 'xyz', author: 'TestAuthor', labels: [] });
    });

    it('renders a feed of test images', async ({ expect }) => {
        const logfn = vi.fn();
        render(
            <ImageFeed
                images={[makeRecommendation('content:xyz'), makeRecommendation('content:xyz')]}
                onLog={logfn}
            />
        );

        expect(screen.getAllByTestId('feed-image-element')).toHaveLength(2);
    });

    it('generates a like log event', async ({ expect }) => {
        const user = userEvent.setup();
        const logfn = vi.fn();
        render(
            <ImageFeed
                images={[makeRecommendation('content:xyz')]}
                onLog={logfn}
            />
        );

        await user.click(screen.getByTestId('feed-image-like-button'));
        //await user.click(screen.getByTestId('like-button'));

        expect(logfn).toHaveBeenCalledWith({ activity: 'like', id: 'content:xyz', timestamp: expect.any(Number) });
    });

    it('generates a share log event', async ({ expect }) => {
        const user = userEvent.setup();
        const logfn = vi.fn();
        render(
            <ImageFeed
                images={[makeRecommendation('content:xyz')]}
                onLog={logfn}
            />
        );

        await user.click(screen.getByTestId('feed-image-share-button'));
        await user.click(screen.getByTestId('share-friends-button'));

        expect(logfn).toHaveBeenCalledWith({
            activity: 'share_friends',
            id: 'content:xyz',
            timestamp: expect.any(Number),
        });
    });

    it('generates a comment log event', async ({ expect }) => {
        const user = userEvent.setup();
        const logfn = vi.fn();
        render(
            <ImageFeed
                images={[makeRecommendation('content:xyz')]}
                onLog={logfn}
            />
        );

        await user.click(screen.getByTestId('feed-image-comment-button'));
        await user.click(screen.getByTestId('comment-input'));
        await user.keyboard('helloworld');
        await user.click(screen.getByTestId('comment-post-button'));

        expect(logfn).toHaveBeenCalledWith({
            activity: 'comment',
            id: 'content:xyz',
            value: 10,
            content: 'helloworld',
            timestamp: expect.any(Number),
        });
    });

    it('generates a follow log event', async ({ expect }) => {
        const user = userEvent.setup();
        const logfn = vi.fn();
        render(
            <ImageFeed
                images={[makeRecommendation('content:xyz')]}
                onLog={logfn}
            />
        );

        await user.click(screen.getByTestId('feed-image-follow-button'));
        expect(logfn).toHaveBeenCalledWith({ activity: 'follow', id: 'content:xyz', timestamp: expect.any(Number) });
    });

    it('generates a seen event', async ({ expect }) => {
        // const user = userEvent.setup();
        const logfn = vi.fn();
        render(
            <ImageFeed
                images={[makeRecommendation('content:xyz')]}
                onLog={logfn}
            />
        );

        expect(logfn).toHaveBeenCalledWith({ activity: 'seen', id: 'content:xyz', timestamp: expect.any(Number) });
    });
});
