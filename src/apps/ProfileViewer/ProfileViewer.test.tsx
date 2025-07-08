import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, vi } from 'vitest';
import { Component } from './ProfileViewer';
import TestWrapper from '@genaism/util/TestWrapper';
import { render, screen } from '@testing-library/react';
import { appConfiguration } from '@genaism/common/state/configState';
import defaultConfig from '../../common/state/defaultConfig.json';
import { SMConfig } from '@genaism/common/state/smConfig';
import { createStore } from 'jotai';
import { PropsWithChildren } from 'react';
import { EventProtocol } from '@genaism/protocol/protocol';
import { Connection } from '@genai-fi/base';
import EventEmitter from 'eventemitter3';

const { mockPeer, mockPeerData, mockSender } = vi.hoisted(() => ({
    mockPeer: {
        on: vi.fn(),
        off: vi.fn(),
    },
    mockPeerData: vi.fn(),
    mockSender: vi.fn(),
}));

vi.mock('@genai-fi/base', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@genai-fi/base')>()),
    ConnectionStatus: vi.fn(() => <div data-testid="connection-status">Connection Status</div>),
}));

vi.mock('@genai-fi/base/hooks/peer', async () => ({
    //...(await importOriginal<typeof import('@genai-fi/base')>()),
    Peer: function Peer(props: PropsWithChildren) {
        return <div>{props.children}</div>;
    },
    usePeerObject: () => mockPeer,
    usePeerStatus: () => 'ready',
    usePeerSender: () => mockSender,
    usePeerData: mockPeerData,
}));

describe('ProfileViewer App', () => {
    it('should render', async ({ expect }) => {
        const ee = new EventEmitter();
        mockPeerData.mockImplementation((cb: (data: EventProtocol) => void) => {
            ee.removeAllListeners('data');
            ee.on('data', cb);
        });

        const store = createStore();
        store.set(appConfiguration, defaultConfig.configuration as SMConfig);
        render(
            <TestWrapper initializeState={store}>
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

        setTimeout(() => {
            ee.emit(
                'data',
                {
                    event: 'eter:config',
                    content: [],
                    configuration: defaultConfig.configuration as SMConfig,
                },
                {} as Connection<EventProtocol>
            );
        }, 100);

        await vi.waitFor(() => {
            expect(screen.getByTestId('app-nav')).toBeVisible();
        });
    });
});
