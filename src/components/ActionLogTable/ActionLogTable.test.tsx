import { describe, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import ActionLogTable from './ActionLogTable';

describe('ActionLogTable component', () => {
    it('renders with no log items', async ({ expect }) => {
        render(<ActionLogTable log={[]} />);

        expect(screen.getByTestId('data-cards')).toBeInTheDocument();
        expect(screen.queryByTestId('data-card')).not.toBeInTheDocument();
    });

    it('shows a single normal item', async ({ expect }) => {
        render(<ActionLogTable log={[{ entry: { activity: 'like', timestamp: Date.now() }, content: '' }]} />);

        expect(screen.getByTestId('data-cards')).toBeInTheDocument();
        expect(screen.getByTestId('data-card')).toBeInTheDocument();
        expect(screen.getByText('feed.actionlog.like')).toBeVisible();
    });

    it('shows multiple normal items', async ({ expect }) => {
        render(
            <ActionLogTable
                log={[
                    { entry: { activity: 'like', timestamp: Date.now() }, content: '' },
                    { entry: { activity: 'dwell', timestamp: Date.now(), value: 3 }, content: '' },
                    { entry: { activity: 'seen', timestamp: Date.now() }, content: '' },
                ]}
            />
        );

        expect(screen.getByTestId('data-cards')).toBeInTheDocument();
        expect(screen.getByTestId('data-card')).toBeInTheDocument();
        expect(screen.getAllByTestId('log-item')).toHaveLength(2);
        expect(screen.getByText('feed.actionlog.like')).toBeVisible();
        expect(screen.getByText('feed.actionlog.dwell')).toBeVisible();
    });

    it('shows a single special item', async ({ expect }) => {
        render(
            <ActionLogTable
                log={[{ entry: { activity: 'engagement', timestamp: Date.now(), value: 0.3 }, content: '' }]}
            />
        );

        expect(screen.getByText('feed.actionlog.engagement')).toBeVisible();
    });
});
