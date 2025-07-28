import { beforeEach, describe, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import FeedImage from './FeedImage';
import userEvent from '@testing-library/user-event';
import { getContentService, getGraphService, getProfilerService } from '@genai-fi/recom';

const TEST_IMAGE =
    'https://images.pexels.com/photos/3030647/pexels-photo-3030647.jpeg?cs=srgb&dl=pexels-nextvoyage-3030647.jpg&fm=jpg';

describe('FeedImage component', () => {
    beforeEach(() => {
        getGraphService().reset();
        const contentSvc = getContentService();
        contentSvc.reset();
        contentSvc.addContent(TEST_IMAGE, { id: 'xyz', author: 'TestAuthor', labels: [] });
        contentSvc.addContent(TEST_IMAGE, { id: 'xyz2', author: 'TestAuthor', labels: [] });
        const profilerSvc = getProfilerService();
        profilerSvc.reset();
    });

    it('renders with a test image', async ({ expect }) => {
        render(
            <FeedImage
                id="content:xyz"
                active
                visible
            />
        );
        expect(screen.getByTestId('feed-image-follow-button')).toBeInTheDocument();
        expect(screen.getByText('TestAuthor')).toBeInTheDocument();
        expect(screen.getByTestId('feed-image-element')).toHaveAttribute('src', TEST_IMAGE);
        expect(screen.getByTestId('feed-image-like-button')).toBeInTheDocument();
        expect(screen.getByTestId('feed-image-comment-button')).toBeInTheDocument();
        expect(screen.getByTestId('feed-image-share-button')).toBeInTheDocument();
    });

    it('shows number of likes', async ({ expect }) => {
        getContentService().addContentReaction('content:xyz');
        render(
            <FeedImage
                id="content:xyz"
                active
                visible
            />
        );

        expect(screen.getByTestId('feed-image-like-button')).toHaveAttribute('data-count', '1');
    });

    it('calls like action on like click', async ({ expect }) => {
        const user = userEvent.setup();
        const likefn = vi.fn();
        render(
            <FeedImage
                id="content:xyz"
                active
                visible
                onLike={likefn}
            />
        );

        await user.click(screen.getByTestId('feed-image-like-button'));
        expect(likefn).toHaveBeenCalledWith('content:xyz', 'like');
    });

    it('shows the comment panel', async ({ expect }) => {
        const user = userEvent.setup();
        render(
            <FeedImage
                id="content:xyz"
                active
                visible
            />
        );

        await user.click(screen.getByTestId('feed-image-comment-button'));

        expect(screen.getByTestId('feed-image-comment-panel')).toBeVisible();
    });

    it('shows number of comments', async ({ expect }) => {
        getContentService().addComment('content:xyz2', 'user:xyz', 'testcomment', 100);
        render(
            <FeedImage
                id="content:xyz2"
                active
                visible
            />
        );

        expect(screen.getByTestId('feed-image-comment-button')).toHaveAttribute('data-count', '1');
    });

    it('calls comment action on enter comment', async ({ expect }) => {
        const user = userEvent.setup();
        const commentfn = vi.fn();
        render(
            <FeedImage
                id="content:xyz"
                active
                visible
                onComment={commentfn}
            />
        );

        await user.click(screen.getByTestId('feed-image-comment-button'));
        await user.click(screen.getByTestId('comment-input'));
        await user.keyboard('helloworld');
        await user.click(screen.getByTestId('comment-post-button'));
        expect(commentfn).toHaveBeenCalledWith('content:xyz', 'helloworld');
    });

    it('displays one comment', async ({ expect }) => {
        const user = userEvent.setup();
        getContentService().addComment('content:xyz', 'user:xyz', 'testcomment', 199);
        render(
            <FeedImage
                id="content:xyz"
                active
                visible
            />
        );

        await user.click(screen.getByTestId('feed-image-comment-button'));

        expect(await screen.findByText('testcomment')).toBeVisible();
    });

    it('can display multiple comments', async ({ expect }) => {
        const user = userEvent.setup();
        const contentSvc = getContentService();
        contentSvc.addComment('content:xyz', 'user:xyz', 'testcomment1', 100);
        contentSvc.addComment('content:xyz', 'user:xyz', 'testcomment2', 200);
        render(
            <FeedImage
                id="content:xyz"
                active
                visible
            />
        );

        await user.click(screen.getByTestId('feed-image-comment-button'));
        await user.click(screen.getByTestId('moreComments-button'));

        expect(screen.getByText('testcomment1')).toBeVisible();
        expect(screen.getByText('testcomment2')).toBeVisible();
    });

    it('shows the share panel', async ({ expect }) => {
        const user = userEvent.setup();
        render(
            <FeedImage
                id="content:xyz"
                active
                visible
            />
        );

        await user.click(screen.getByTestId('feed-image-share-button'));

        expect(screen.getByTestId('feed-image-share-panel')).toBeVisible();
    });

    it('calls share action on share with user', async ({ expect }) => {
        const profilerSvc = getProfilerService();
        const profile = profilerSvc.createUserProfile('user:1', 'NoName1');
        profile.embeddings.taste = [1];
        const user = userEvent.setup();
        const sharefn = vi.fn();
        render(
            <FeedImage
                id="content:xyz"
                active
                visible
                onShare={sharefn}
            />
        );

        await user.click(screen.getByTestId('feed-image-share-button'));
        await user.click(await screen.findByLabelText('NoName1'));
        expect(sharefn).toHaveBeenCalledWith('content:xyz', 'public', 'user:1');
    });

    it('can hide actions', async ({ expect }) => {
        render(
            <FeedImage
                id="content:xyz"
                active
                visible
                noActions
            />
        );

        expect(screen.queryByTestId('feed-image-share-button')).not.toBeInTheDocument();
    });
});
