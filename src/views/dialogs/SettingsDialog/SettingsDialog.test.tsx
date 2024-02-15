import { describe, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import SettingsDialog from './SettingsDialog';
import TestWrapper from '@genaism/util/TestWrapper';
import { menuShowSettings } from '@genaism/state/menuState';
import userEvent from '@testing-library/user-event';

describe('Settings Dialog', () => {
    it('shows general settings', async ({ expect }) => {
        render(
            <TestWrapper
                initializeState={({ set }) => {
                    set(menuShowSettings, true);
                }}
            >
                <SettingsDialog />
            </TestWrapper>
        );

        expect(screen.getByText('dashboard.labels.collectResearch')).toBeVisible();
    });

    it('shows feed settings', async ({ expect }) => {
        const user = userEvent.setup();

        render(
            <TestWrapper
                initializeState={({ set }) => {
                    set(menuShowSettings, true);
                }}
            >
                <SettingsDialog />
            </TestWrapper>
        );

        await user.click(screen.getByText('dashboard.titles.feedApp'));

        expect(screen.getByText('dashboard.labels.disableFeedApp')).toBeVisible();
    });

    it('shows social graph settings', async ({ expect }) => {
        const user = userEvent.setup();

        render(
            <TestWrapper
                initializeState={({ set }) => {
                    set(menuShowSettings, true);
                }}
            >
                <SettingsDialog />
            </TestWrapper>
        );

        await user.click(screen.getByText('dashboard.titles.socialGraph'));

        expect(screen.getByText('dashboard.labels.engagedImages')).toBeVisible();
    });
});
