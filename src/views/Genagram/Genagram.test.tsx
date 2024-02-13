import { describe, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Component as Genagram } from './Genagram';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PeerEvent, PeerProps } from '@genaism/hooks/peer';
import TestWrapper from '@genaism/util/TestWrapper';
import { iceConfig, webrtcActive } from '@genaism/state/webrtcState';
import { appConfiguration } from '@genaism/state/settingsState';

const { mockPeer } = vi.hoisted(() => ({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mockPeer: vi.fn((_props: PeerProps<PeerEvent>) => ({
        ready: true,
        status: 'ready',
        error: 'none',
        send: vi.fn(),
    })),
}));

vi.mock('@genaism/hooks/peer', () => ({
    default: mockPeer,
}));

describe('Genagram view', () => {
    it('renders the username form', async ({ expect }) => {
        render(
            <TestWrapper
                initializeState={({ set }) => {
                    set(webrtcActive, 'full');
                    set(iceConfig, { expiresOn: new Date(), iceServers: [] });
                    set(appConfiguration, {
                        recommendations: {
                            taste: 0,
                            random: 0,
                            coengaged: 0,
                            similarUsers: 0,
                        },
                    });
                }}
            >
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
});
