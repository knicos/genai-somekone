import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeAll, describe, it, vi } from 'vitest';
import { Component } from './Flow';
import TestWrapper from '@genaism/util/TestWrapper';
import { render, screen } from '@testing-library/react';
import { currentUserName } from '@genaism/common/state/sessionState';
import { appConfiguration } from '@genaism/common/state/configState';
import defaultConfig from '../../common/state/defaultConfig.json';
import { SMConfig } from '@genaism/common/state/smConfig';
import { usePeer } from '@genai-fi/base';
import { createStore } from 'jotai';

type PeerProps = Parameters<typeof usePeer>[0];

const { mockPeer } = vi.hoisted(() => ({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mockPeer: vi.fn((_props: PeerProps) => ({
        ready: true,
        status: 'ready',
        error: 'none',
        send: vi.fn(),
    })),
}));

vi.mock('@genai-fi/base', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@genai-fi/base')>()),
    usePeer: mockPeer,
}));

describe('Flow App', () => {
    beforeAll(() => {
        global.ResizeObserver = class ResizeObserver {
            observe() {
                // do nothing
            }
            unobserve() {
                // do nothing
            }
            disconnect() {
                // do nothing
            }
        };
    });

    it('should render', async ({ expect }) => {
        const store = createStore();
        store.set(currentUserName, 'TestUser');
        store.set(appConfiguration, defaultConfig.configuration as SMConfig);

        render(
            <TestWrapper initializeState={store}>
                <MemoryRouter initialEntries={['/flow/1234']}>
                    <Routes>
                        <Route
                            path="flow/:code"
                            element={<Component />}
                        />
                    </Routes>
                </MemoryRouter>
            </TestWrapper>
        );

        expect(screen.getByTestId('widget-workflow.titles.map')).toBeVisible();
    });
});
