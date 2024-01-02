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
        render(<ActionLogTable log={[{ activity: 'like', timestamp: Date.now() }]} />);

        expect(screen.getByTestId('data-cards')).toBeInTheDocument();
        expect(screen.getByTestId('data-card')).toBeInTheDocument();
        expect(screen.getByText('feed.actionlog.like')).toBeVisible();
    });

    it('shows multiple normal items', async ({ expect }) => {
        render(
            <ActionLogTable
                log={[
                    { activity: 'like', timestamp: Date.now() },
                    { activity: 'love', timestamp: Date.now() },
                    { activity: 'dwell', timestamp: Date.now(), value: 3 },
                ]}
            />
        );

        expect(screen.getByTestId('data-cards')).toBeInTheDocument();
        expect(screen.getByTestId('data-card')).toBeInTheDocument();
        expect(screen.getAllByTestId('log-item')).toHaveLength(2);
        expect(screen.getByText('feed.actionlog.like')).toBeVisible();
        expect(screen.getByText('feed.actionlog.love')).toBeVisible();
        expect(screen.getByText('feed.actionlog.dwell')).toBeVisible();
    });

    it('shows a single special item', async ({ expect }) => {
        render(<ActionLogTable log={[{ activity: 'engagement', timestamp: Date.now(), value: 0.3 }]} />);

        expect(screen.getByText('feed.actionlog.engagement')).toBeVisible();
    });
});
