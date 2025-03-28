import { describe, it, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { Component as Dashboard } from './Dashboard';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Connection, usePeer } from '@knicos/genai-base';
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

type PeerProps = Parameters<typeof usePeer<EventProtocol>>[0];

const { mockPeer } = vi.hoisted(() => ({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mockPeer: vi.fn((_props: PeerProps) => ({
        ready: true,
        peer: {
            on: vi.fn(),
            off: vi.fn(),
        },
        sender: vi.fn(),
    })),
}));

vi.mock('@knicos/genai-base', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@knicos/genai-base')>()),
    usePeer: mockPeer,
    QRCode: function QRCode() {
        return null;
    },
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
            return {
                ready: true,
                peer: {
                    on: vi.fn(),
                    off: vi.fn(),
                },
                sender: mockSender,
            };
        });

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
            return {
                ready: true,
                peer: {
                    on: vi.fn(),
                    off: vi.fn(),
                },
                sender: mockSender,
            };
        });

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

        expect(screen.getByTestId('widget-workflow.titles.map')).toBeVisible();
    });
});
