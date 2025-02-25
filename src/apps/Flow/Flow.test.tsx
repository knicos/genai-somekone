import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeAll, describe, it, vi } from 'vitest';
import { Component } from './Flow';
import TestWrapper from '@genaism/util/TestWrapper';
import { render, screen } from '@testing-library/react';
import { currentUserName } from '@genaism/common/state/sessionState';
import { appConfiguration } from '@genaism/common/state/configState';
import defaultConfig from '../../common/state/defaultConfig.json';
import { SMConfig } from '@genaism/common/state/smConfig';
import { usePeer } from '@knicos/genai-base';

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

vi.mock('@knicos/genai-base', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@knicos/genai-base')>()),
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
        render(
            <TestWrapper
                initializeState={({ set }) => {
                    set(currentUserName, 'TestUser');
                    set(appConfiguration, defaultConfig.configuration as SMConfig);
                }}
            >
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
