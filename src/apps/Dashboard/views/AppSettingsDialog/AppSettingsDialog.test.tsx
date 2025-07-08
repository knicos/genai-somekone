import { describe, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import TestWrapper from '@genaism/util/TestWrapper';
import AppSettingsDialog from './AppSettingsDialog';
import { menuSettingsDialog } from '../../state/menuState';
import defaultConfig from '../../../../common/state/defaultConfig.json';
import { appConfiguration } from '@genaism/common/state/configState';
import { SMConfig } from '@genaism/common/state/smConfig';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { createStore } from 'jotai';

const store = createStore();
store.set(appConfiguration, defaultConfig.configuration as SMConfig);
store.set(menuSettingsDialog, 'app');

describe('AppSettingsDialog', () => {
    it('should render', ({ expect }) => {
        render(
            <TestWrapper initializeState={store}>
                <MemoryRouter initialEntries={['/test']}>
                    <Routes>
                        <Route
                            path="/test"
                            element={<AppSettingsDialog />}
                        />
                    </Routes>
                </MemoryRouter>
            </TestWrapper>
        );

        expect(screen.getByText('settings.titles.feed')).toBeVisible();
        expect(screen.getByText('settings.app.disableComments')).toBeVisible();
    });

    it('can show menu settings', async ({ expect }) => {
        const user = userEvent.setup();

        render(
            <TestWrapper initializeState={store}>
                <MemoryRouter initialEntries={['/test']}>
                    <Routes>
                        <Route
                            path="/test"
                            element={<AppSettingsDialog />}
                        />
                    </Routes>
                </MemoryRouter>
            </TestWrapper>
        );

        await user.click(screen.getByText('settings.titles.appmenu'));

        expect(screen.getByText('settings.app.hideDataView')).toBeVisible();
    });

    it('can show recom settings', async ({ expect }) => {
        const user = userEvent.setup();

        render(
            <TestWrapper initializeState={store}>
                <MemoryRouter initialEntries={['/test']}>
                    <Routes>
                        <Route
                            path="/test"
                            element={<AppSettingsDialog />}
                        />
                    </Routes>
                </MemoryRouter>
            </TestWrapper>
        );

        await user.click(screen.getByText('settings.titles.recom'));

        expect(screen.getByText('settings.app.showCandidateWizard')).toBeVisible();
    });
});
