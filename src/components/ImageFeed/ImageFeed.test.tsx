import { describe, it, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ImageFeed from './ImageFeed';
import { addContent } from '../../services/content/content';
import { resetGraph } from '../../services/graph/graph';
import userEvent from '@testing-library/user-event';

const TEST_IMAGE =
    'https://images.pexels.com/photos/3030647/pexels-photo-3030647.jpeg?cs=srgb&dl=pexels-nextvoyage-3030647.jpg&fm=jpg';

describe('ImageFeed component', () => {
    beforeEach(() => {
        addContent(TEST_IMAGE, { id: 'xyz', author: 'TestAuthor', labels: [] });
    });

    afterEach(() => {
        resetGraph();
    });

    it('renders a feed of test images', async ({ expect }) => {
        const logfn = vi.fn();
        render(
            <ImageFeed
                images={['xyz', 'xyz']}
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
                images={['xyz']}
                onLog={logfn}
            />
        );

        await user.click(screen.getByTestId('feed-image-like-button'));
        await user.click(screen.getByTestId('like-button'));

        expect(logfn).toHaveBeenCalledWith({ activity: 'like', id: 'xyz', timestamp: expect.any(Number) });
    });

    it('generates a share log event', async ({ expect }) => {
        const user = userEvent.setup();
        const logfn = vi.fn();
        render(
            <ImageFeed
                images={['xyz']}
                onLog={logfn}
            />
        );

        await user.click(screen.getByTestId('feed-image-share-button'));
        await user.click(screen.getByTestId('share-friends-button'));

        expect(logfn).toHaveBeenCalledWith({ activity: 'share_friends', id: 'xyz', timestamp: expect.any(Number) });
    });

    it('generates a comment log event', async ({ expect }) => {
        const user = userEvent.setup();
        const logfn = vi.fn();
        render(
            <ImageFeed
                images={['xyz']}
                onLog={logfn}
            />
        );

        await user.click(screen.getByTestId('feed-image-comment-button'));
        await user.click(screen.getByTestId('comment-input'));
        await user.keyboard('helloworld[Enter]');

        expect(logfn).toHaveBeenCalledWith({
            activity: 'comment',
            id: 'xyz',
            value: 10,
            timestamp: expect.any(Number),
        });
    });

    it('generates a follow log event', async ({ expect }) => {
        const user = userEvent.setup();
        const logfn = vi.fn();
        render(
            <ImageFeed
                images={['xyz']}
                onLog={logfn}
            />
        );

        await user.click(screen.getByTestId('feed-image-follow-button'));
        expect(logfn).toHaveBeenCalledWith({ activity: 'follow', id: 'xyz', timestamp: expect.any(Number) });
    });

    it('generates a seen event', async ({ expect }) => {
        // const user = userEvent.setup();
        const logfn = vi.fn();
        render(
            <ImageFeed
                images={['xyz']}
                onLog={logfn}
            />
        );

        expect(logfn).toHaveBeenCalledWith({ activity: 'seen', id: 'xyz', timestamp: expect.any(Number) });
    });
});
