import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, it, vi } from 'vitest';
import { Component } from './ProfileViewer';
import TestWrapper from '@genaism/util/TestWrapper';
import { render, screen } from '@testing-library/react';
import { appConfiguration } from '@genaism/common/state/configState';
import defaultConfig from '../../common/state/defaultConfig.json';
import { SMConfig } from '@genaism/common/state/smConfig';
import { Connection, PeerEvent, usePeer } from '@knicos/genai-base';
import { EventProtocol } from '@genaism/protocol/protocol';

type PeerProps = Parameters<typeof usePeer<EventProtocol>>[0];

const { mockPeer } = vi.hoisted(() => ({
    mockPeer: vi.fn((props: PeerProps) => {
        setTimeout(() => {
            if (props.onData)
                props.onData(
                    {
                        event: 'eter:config',
                        content: [],
                        configuration: defaultConfig.configuration as SMConfig,
                    },
                    {} as Connection<PeerEvent>
                );
        }, 0);
        return {
            ready: true,
            peer: {
                on: vi.fn(),
                off: vi.fn(),
            },
            send: vi.fn(),
        };
    }),
}));

vi.mock('@knicos/genai-base', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@knicos/genai-base')>()),
    usePeer: mockPeer,
}));

describe('ProfileViewer App', () => {
    it('should render', async ({ expect }) => {
        render(
            <TestWrapper
                initializeState={({ set }) => {
                    set(appConfiguration, defaultConfig.configuration as SMConfig);
                }}
            >
                <MemoryRouter initialEntries={['/viewer/1234']}>
                    <Routes>
                        <Route
                            path="viewer/:code"
                            element={<Component />}
                        />
                    </Routes>
                </MemoryRouter>
            </TestWrapper>
        );

        await vi.waitFor(() => {
            expect(screen.getByTestId('app-nav')).toBeVisible();
        });
    });
});
