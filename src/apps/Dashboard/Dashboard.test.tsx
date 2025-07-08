import { describe, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Component as Dashboard } from './Dashboard';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Connection } from '@genai-fi/base';
import { EventProtocol } from '@genaism/protocol/protocol';
import TestWrapper from '@genaism/util/TestWrapper';
import { Component as UserGrid } from './subviews/UserGrid';
import { Component as UserTable } from './subviews/UserTable';
import { Component as HeatmapCompare } from './subviews/HeatmapCompare';
import { Component as SocialGraph } from './subviews/SocialGraph';
import { Component as TopicGraph } from './subviews/TopicGraph';
import { Component as LogTable } from './subviews/LogTable';
import { Component as TopicTable } from './subviews/TopicTable';
import { Component as Workflow } from './subviews/Workflow';
import { Component as ContentEngagements } from './subviews/ContentEngagements';
import { Component as ContentGraph } from './subviews/ContentGraph';
import { PropsWithChildren } from 'react';
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
    QRCode: function QRCode() {
        return null;
    },
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
            <MemoryRouter initialEntries={['/dashboard?content=']}>
                <Routes>
                    <Route
                        path="dashboard"
                        element={<Dashboard />}
                    />
                </Routes>
            </MemoryRouter>,
            { wrapper: TestWrapper }
        );

        await vi.waitFor(() => {
            expect(screen.getByTestId('dashboard-start-button')).toBeVisible();
            expect(mockPeerData).toHaveBeenCalled();
        });
    });

    it('shows one user connected', async ({ expect }) => {
        const ee = new EventEmitter();
        mockPeerData.mockImplementation((cb: (data: EventProtocol) => void) => {
            ee.removeAllListeners('data');
            ee.on('data', cb);
        });
        const mockSender = vi.fn();

        render(
            <MemoryRouter initialEntries={['/dashboard?content=']}>
                <Routes>
                    <Route
                        path="dashboard"
                        element={<Dashboard />}
                    />
                </Routes>
            </MemoryRouter>,
            { wrapper: TestWrapper }
        );

        setTimeout(() => {
            ee.emit('data', { event: 'eter:reguser', username: 'dummy', id: 'user:xyz1' }, {
                send: mockSender,
            } as unknown as Connection<EventProtocol>);
        }, 100);

        expect(await screen.findByText('dashboard.messages.onePerson')).toBeInTheDocument();
    });

    it('shows two users connected', async ({ expect }) => {
        const ee = new EventEmitter();
        mockPeerData.mockImplementation((cb: (data: EventProtocol) => void) => {
            ee.removeAllListeners('data');
            ee.on('data', cb);
        });
        const mockSender = vi.fn();

        render(
            <MemoryRouter initialEntries={['/dashboard?content=']}>
                <Routes>
                    <Route
                        path="dashboard"
                        element={<Dashboard />}
                    />
                </Routes>
            </MemoryRouter>,
            { wrapper: TestWrapper }
        );

        setTimeout(() => {
            ee.emit('data', { event: 'eter:reguser', username: 'dummy', id: 'user:xyz1' }, {
                send: mockSender,
            } as unknown as Connection<EventProtocol>);
        }, 100);

        setTimeout(() => {
            ee.emit('data', { event: 'eter:reguser', username: 'dummy2', id: 'user:xyz2' }, {
                send: mockSender,
            } as unknown as Connection<EventProtocol>);
        }, 150);

        expect(await screen.findByText('dashboard.messages.manyPeople')).toBeInTheDocument();
    });

    it('renders the user grid', async ({ expect }) => {
        render(
            <MemoryRouter initialEntries={['/dashboard/grid?content=']}>
                <Routes>
                    <Route
                        path="dashboard"
                        element={<Dashboard />}
                    >
                        <Route
                            path="grid"
                            element={<UserGrid />}
                        />
                    </Route>
                </Routes>
            </MemoryRouter>,
            { wrapper: TestWrapper }
        );

        //vi.waitFor(() => {
        expect(screen.getByTestId('usergrid')).toBeVisible();
        //    expect(mockPeer).toHaveBeenCalled();
        //});
    });

    it('renders the social graph', async ({ expect }) => {
        render(
            <MemoryRouter initialEntries={['/dashboard/graph?content=']}>
                <Routes>
                    <Route
                        path="dashboard"
                        element={<Dashboard />}
                    >
                        <Route
                            path="graph"
                            element={<SocialGraph />}
                        />
                    </Route>
                </Routes>
            </MemoryRouter>,
            { wrapper: TestWrapper }
        );

        //vi.waitFor(() => {
        expect(screen.getByTestId('graph-svg')).toBeVisible();
        //    expect(mockPeer).toHaveBeenCalled();
        //});
    });

    it('renders the content graph', async ({ expect }) => {
        render(
            <MemoryRouter initialEntries={['/dashboard/graph?content=']}>
                <Routes>
                    <Route
                        path="dashboard"
                        element={<Dashboard />}
                    >
                        <Route
                            path="graph"
                            element={<ContentGraph />}
                        />
                    </Route>
                </Routes>
            </MemoryRouter>,
            { wrapper: TestWrapper }
        );

        expect(screen.getByTestId('graph-svg')).toBeVisible();
    });

    it('renders the heatmaps', async ({ expect }) => {
        render(
            <MemoryRouter initialEntries={['/dashboard/heat?content=']}>
                <Routes>
                    <Route
                        path="dashboard"
                        element={<Dashboard />}
                    >
                        <Route
                            path="heat"
                            element={<HeatmapCompare />}
                        />
                    </Route>
                </Routes>
            </MemoryRouter>,
            { wrapper: TestWrapper }
        );

        expect(screen.getByTestId('heatmap-svg')).toBeVisible();
    });

    it('renders the user table', async ({ expect }) => {
        render(
            <MemoryRouter initialEntries={['/dashboard/table?content=']}>
                <Routes>
                    <Route
                        path="dashboard"
                        element={<Dashboard />}
                    >
                        <Route
                            path="table"
                            element={<UserTable />}
                        />
                    </Route>
                </Routes>
            </MemoryRouter>,
            { wrapper: TestWrapper }
        );

        expect(screen.getByTestId('user-table')).toBeVisible();
    });

    it('renders the topic graph', async ({ expect }) => {
        render(
            <MemoryRouter initialEntries={['/dashboard/graph?content=']}>
                <Routes>
                    <Route
                        path="dashboard"
                        element={<Dashboard />}
                    >
                        <Route
                            path="graph"
                            element={<TopicGraph />}
                        />
                    </Route>
                </Routes>
            </MemoryRouter>,
            { wrapper: TestWrapper }
        );

        expect(screen.getByTestId('graph-svg')).toBeVisible();
    });

    it('renders the log table', async ({ expect }) => {
        render(
            <MemoryRouter initialEntries={['/dashboard/table?content=']}>
                <Routes>
                    <Route
                        path="dashboard"
                        element={<Dashboard />}
                    >
                        <Route
                            path="table"
                            element={<LogTable />}
                        />
                    </Route>
                </Routes>
            </MemoryRouter>,
            { wrapper: TestWrapper }
        );

        expect(screen.getByTestId('log-table')).toBeVisible();
    });

    it('renders the topic table', async ({ expect }) => {
        render(
            <MemoryRouter initialEntries={['/dashboard/table?content=']}>
                <Routes>
                    <Route
                        path="dashboard"
                        element={<Dashboard />}
                    >
                        <Route
                            path="table"
                            element={<TopicTable />}
                        />
                    </Route>
                </Routes>
            </MemoryRouter>,
            { wrapper: TestWrapper }
        );

        expect(screen.getByTestId('topic-table')).toBeVisible();
    });

    it('renders the content engagements', async ({ expect }) => {
        render(
            <MemoryRouter initialEntries={['/dashboard/table?content=']}>
                <Routes>
                    <Route
                        path="dashboard"
                        element={<Dashboard />}
                    >
                        <Route
                            path="table"
                            element={<ContentEngagements />}
                        />
                    </Route>
                </Routes>
            </MemoryRouter>,
            { wrapper: TestWrapper }
        );

        expect(screen.getByTestId('content-engagements')).toBeVisible();
    });

    it('renders the workflow', async ({ expect }) => {
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

        render(
            <MemoryRouter initialEntries={['/dashboard/flow?content=']}>
                <Routes>
                    <Route
                        path="dashboard"
                        element={<Dashboard />}
                    >
                        <Route
                            path="flow"
                            element={<Workflow />}
                        />
                    </Route>
                </Routes>
            </MemoryRouter>,
            { wrapper: TestWrapper }
        );

        expect(await screen.findByTestId('widget-workflow.titles.map')).toBeVisible();
    });
});
