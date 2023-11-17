import { afterEach, beforeEach, describe, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import FeedImage from './FeedImage';
import { addContent } from '@genaism/services/content/content';
import { resetGraph } from '@genaism/services/graph/graph';
import userEvent from '@testing-library/user-event';

const TEST_IMAGE =
    'https://images.pexels.com/photos/3030647/pexels-photo-3030647.jpeg?cs=srgb&dl=pexels-nextvoyage-3030647.jpg&fm=jpg';

describe('FeedImage component', () => {
    beforeEach(() => {
        addContent(TEST_IMAGE, { id: 'xyz', author: 'TestAuthor', labels: [] });
    });

    afterEach(() => {
        resetGraph();
    });

    it('renders with a test image', async ({ expect }) => {
        render(
            <FeedImage
                id="xyz"
                active
                visible
            />
        );
        expect(screen.getByText('feed.actions.follow')).toBeInTheDocument();
        expect(screen.getByText('TestAuthor')).toBeInTheDocument();
        expect(screen.getByTestId('feed-image-element')).toHaveAttribute('src', TEST_IMAGE);
        expect(screen.getByTestId('feed-image-like-button')).toBeInTheDocument();
        expect(screen.getByTestId('feed-image-comment-button')).toBeInTheDocument();
        expect(screen.getByTestId('feed-image-share-button')).toBeInTheDocument();
    });

    it('shows the like panel', async ({ expect }) => {
        const user = userEvent.setup();
        render(
            <FeedImage
                id="xyz"
                active
                visible
            />
        );

        await user.click(screen.getByTestId('feed-image-like-button'));

        expect(screen.getByTestId('feed-image-like-panel')).toBeVisible();
    });

    it('calls like action on like click', async ({ expect }) => {
        const user = userEvent.setup();
        const likefn = vi.fn();
        render(
            <FeedImage
                id="xyz"
                active
                visible
                onLike={likefn}
            />
        );

        await user.click(screen.getByTestId('feed-image-like-button'));
        await user.click(screen.getByTestId('like-button'));
        expect(likefn).toHaveBeenCalledWith('xyz', 'like');
    });

    it('calls like action on wow click', async ({ expect }) => {
        const user = userEvent.setup();
        const likefn = vi.fn();
        render(
            <FeedImage
                id="xyz"
                active
                visible
                onLike={likefn}
            />
        );

        await user.click(screen.getByTestId('feed-image-like-button'));
        await user.click(screen.getByTestId('wow-button'));
        expect(likefn).toHaveBeenCalledWith('xyz', 'wow');
    });

    it('shows the comment panel', async ({ expect }) => {
        const user = userEvent.setup();
        render(
            <FeedImage
                id="xyz"
                active
                visible
            />
        );

        await user.click(screen.getByTestId('feed-image-comment-button'));

        expect(screen.getByTestId('feed-image-comment-panel')).toBeVisible();
    });

    it('calls comment action on enter comment', async ({ expect }) => {
        const user = userEvent.setup();
        const commentfn = vi.fn();
        render(
            <FeedImage
                id="xyz"
                active
                visible
                onComment={commentfn}
            />
        );

        await user.click(screen.getByTestId('feed-image-comment-button'));
        await user.click(screen.getByTestId('comment-input'));
        await user.keyboard('helloworld[Enter]');
        expect(commentfn).toHaveBeenCalledWith('xyz', 10);
    });

    it('shows the share panel', async ({ expect }) => {
        const user = userEvent.setup();
        render(
            <FeedImage
                id="xyz"
                active
                visible
            />
        );

        await user.click(screen.getByTestId('feed-image-share-button'));

        expect(screen.getByTestId('feed-image-share-panel')).toBeVisible();
    });

    it('calls share action on share friends', async ({ expect }) => {
        const user = userEvent.setup();
        const sharefn = vi.fn();
        render(
            <FeedImage
                id="xyz"
                active
                visible
                onShare={sharefn}
            />
        );

        await user.click(screen.getByTestId('feed-image-share-button'));
        await user.click(screen.getByTestId('share-friends-button'));
        expect(sharefn).toHaveBeenCalledWith('xyz', 'friends');
    });
});
