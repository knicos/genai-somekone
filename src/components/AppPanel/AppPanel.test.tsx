import { describe, it, vi } from 'vitest';
import AppPanel from './AppPanel';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('AppPanel Component', () => {
    it('renders an empty panel', async ({ expect }) => {
        render(
            <AppPanel title="TestTitle">
                <span>TestMessage</span>
            </AppPanel>
        );

        expect(screen.getByText('TestTitle')).toBeVisible();
        expect(screen.getByText('TestMessage')).toBeVisible();
    });

    it('can be closed', async ({ expect }) => {
        const closeFn = vi.fn();
        const user = userEvent.setup();

        render(
            <AppPanel onClose={closeFn}>
                <span>TestMessage</span>
            </AppPanel>
        );

        expect(screen.getByText('TestMessage')).toBeVisible();
        await user.click(screen.getByTestId('panel-close-button'));
        waitFor(() => expect(closeFn).toHaveBeenCalledOnce());
    });
});
