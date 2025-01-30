import { describe, it, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { Component as Dashboard } from './Dashboard';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Connection, usePeer } from '@knicos/genai-base';
import { EventProtocol } from '@genaism/protocol/protocol';
import TestWrapper from '@genaism/util/TestWrapper';

type PeerProps = Parameters<typeof usePeer<EventProtocol>>[0];

const { mockPeer } = vi.hoisted(() => ({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mockPeer: vi.fn((_props: PeerProps) => ({
        ready: true,
        sender: vi.fn(),
    })),
}));

vi.mock('@knicos/genai-base', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@knicos/genai-base')>()),
    usePeer: mockPeer,
}));

vi.mock('@genaism/services/loader/session', () => ({
    loadSession: () => {},
}));

vi.mock('qrcode', () => ({
    default: {
        toCanvas: async () => {},
    },
}));

vi.mock('@genaism/services/loader/fileLoader', () => ({
    getZipBlob: vi.fn(async () => new Blob(['somedata'])),
    loadFile: vi.fn(async () => {}),
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
            </MemoryRouter>,
            { wrapper: TestWrapper }
        );

        vi.waitFor(() => {
            expect(screen.getByTestId('dashboard-start-button')).toBeVisible();
            expect(mockPeer).toHaveBeenCalled();
        });
    });

    it('shows one user connected', async ({ expect }) => {
        const mockSender = vi.fn();
        const propsObj = {
            props: {} as PeerProps,
        };

        mockPeer.mockImplementation((props: PeerProps) => {
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
            </MemoryRouter>,
            { wrapper: TestWrapper }
        );

        act(() => {
            if (propsObj.props.onData) {
                propsObj.props.onData({ event: 'eter:reguser', username: 'dummy', id: 'user:xyz1' }, {
                    send: vi.fn(),
                } as unknown as Connection<EventProtocol>);
            }
        });

        expect(await screen.findByText('dashboard.messages.onePerson')).toBeInTheDocument();
    });

    it('shows two users connected', async ({ expect }) => {
        const mockSender = vi.fn();
        const propsObj = {
            props: {} as PeerProps,
        };

        mockPeer.mockImplementation((props: PeerProps) => {
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
            </MemoryRouter>,
            { wrapper: TestWrapper }
        );

        act(() => {
            if (propsObj.props.onData) {
                propsObj.props.onData({ event: 'eter:reguser', username: 'dummy', id: 'user:xyz1' }, {
                    send: vi.fn(),
                } as unknown as Connection<EventProtocol>);
                propsObj.props.onData({ event: 'eter:reguser', username: 'dumm2', id: 'user:xyz2' }, {
                    send: vi.fn(),
                } as unknown as Connection<EventProtocol>);
            }
        });

        expect(await screen.findByText('dashboard.messages.manyPeople')).toBeInTheDocument();
    });
});
