import { describe, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Component as Dashboard } from './Dashboard';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PeerEvent, PeerProps } from '@genaism/hooks/peer';
import { EventProtocol } from '@genaism/protocol/protocol';
import { DataConnection } from 'peerjs';

const { mockPeer } = vi.hoisted(() => ({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mockPeer: vi.fn((_props: PeerProps<PeerEvent>) => ({
        ready: true,
        sender: vi.fn(),
    })),
}));

vi.mock('@genaism/hooks/peer', () => ({
    default: mockPeer,
}));

describe('Dashboard view', () => {
    it('renders the initial connection screen', async ({ expect }) => {
        render(
            <MemoryRouter initialEntries={['/dashboard']}>
                <Routes>
                    <Route
                        path="dashboard"
                        element={<Dashboard />}
                    />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByTestId('dashboard-start-button')).toBeVisible();
        expect(mockPeer).toHaveBeenCalled();
    });

    it('shows one user connected', async ({ expect }) => {
        const mockSender = vi.fn();
        const propsObj = {
            props: {} as PeerProps<EventProtocol>,
        };

        mockPeer.mockImplementation((props: PeerProps<EventProtocol>) => {
            propsObj.props = props;
            return { ready: true, sender: mockSender };
        });

        render(
            <MemoryRouter initialEntries={['/dashboard']}>
                <Routes>
                    <Route
                        path="dashboard"
                        element={<Dashboard />}
                    />
                </Routes>
            </MemoryRouter>
        );

        if (propsObj.props.onData) {
            propsObj.props.onData({ event: 'eter:reguser', username: 'dummy' }, {} as DataConnection);
        }

        await vi.waitFor(() => expect(screen.getByText('dashboard.messages.onePerson')).toBeInTheDocument());
    });

    it('shows two users connected', async ({ expect }) => {
        const mockSender = vi.fn();
        const propsObj = {
            props: {} as PeerProps<EventProtocol>,
        };

        mockPeer.mockImplementation((props: PeerProps<EventProtocol>) => {
            propsObj.props = props;
            return { ready: true, sender: mockSender };
        });

        render(
            <MemoryRouter initialEntries={['/dashboard']}>
                <Routes>
                    <Route
                        path="dashboard"
                        element={<Dashboard />}
                    />
                </Routes>
            </MemoryRouter>
        );

        if (propsObj.props.onData) {
            propsObj.props.onData({ event: 'eter:reguser', username: 'dummy' }, {} as DataConnection);
            propsObj.props.onData({ event: 'eter:reguser', username: 'dumm2' }, {} as DataConnection);
        }

        await vi.waitFor(() => expect(screen.getByText('dashboard.messages.manyPeople')).toBeInTheDocument());
    });
});
