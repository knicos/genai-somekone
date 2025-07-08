import { describe, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Component as Genagram } from './Somegram';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import TestWrapper from '@genaism/util/TestWrapper';
import { appConfiguration } from '@genaism/common/state/configState';
import { currentUserName } from '@genaism/common/state/sessionState';
import { createStore } from 'jotai';
import { PropsWithChildren } from 'react';

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
    usePeerClose: vi.fn(),
    usePeerData: mockPeerData,
}));

describe('Genagram view', () => {
    it('renders the username form', async ({ expect }) => {
        const store = createStore();
        store.set(appConfiguration, {
            recommendations: {
                taste: 0,
                random: 0,
                coengaged: 0,
                similarUsers: 0,
                popular: 0,
            },
        });

        render(
            <TestWrapper initializeState={store}>
                <MemoryRouter initialEntries={['/feed/1234']}>
                    <Routes>
                        <Route
                            path="feed/:code"
                            element={<Genagram />}
                        />
                    </Routes>
                </MemoryRouter>
            </TestWrapper>
        );

        await vi.waitFor(() => expect(screen.getByText('feed.labels.enterUsername')).toBeVisible());
    });

    it('renders feed', async ({ expect }) => {
        const store = createStore();
        store.set(appConfiguration, {
            recommendations: {
                taste: 0,
                random: 0,
                coengaged: 0,
                similarUsers: 0,
                popular: 0,
            },
        });
        store.set(currentUserName, 'TestUser');

        render(
            <TestWrapper initializeState={store}>
                <MemoryRouter initialEntries={['/feed/1234/feed']}>
                    <Routes>
                        <Route
                            path="feed/:code"
                            element={<Genagram />}
                        >
                            <Route
                                path="feed"
                                element={<div data-testid="feed-mock">Feed</div>}
                            />
                        </Route>
                    </Routes>
                </MemoryRouter>
            </TestWrapper>
        );

        await vi.waitFor(() => expect(screen.getByTestId('feed-mock')).toBeVisible());
    });
});
