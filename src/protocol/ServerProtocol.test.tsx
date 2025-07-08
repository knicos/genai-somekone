import { beforeEach, describe, it, vi } from 'vitest';
import ServerProtocol from './ServerProtocol';
import { render } from '@testing-library/react';
import TestWrapper from '@genaism/util/TestWrapper';
import { getGraphService } from '@knicos/genai-recom';
import { PropsWithChildren } from 'react';
import EventEmitter from 'eventemitter3';
import { EventProtocol } from './protocol';
import DEFAULT from '../common/state/defaultConfig.json';

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

describe('ServerProtocol Component', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        getGraphService().reset();
    });

    it('responds with ready if connected', async ({ expect }) => {
        const onReady = vi.fn();
        render(
            <TestWrapper>
                <ServerProtocol
                    onReady={onReady}
                    content={[]}
                />
            </TestWrapper>
        );

        expect(mockPeerData).toHaveBeenCalled();
        expect(onReady).toHaveBeenCalled();
    });

    it('responds correctly to a new connection', async ({ expect }) => {
        const conn = {
            send: vi.fn(),
        };
        const ee = new EventEmitter();
        mockPeerData.mockImplementation((cb: (data: EventProtocol) => void) => {
            ee.removeAllListeners('data');
            ee.on('data', cb);
        });

        const onReady = vi.fn();
        render(
            <TestWrapper>
                <ServerProtocol
                    onReady={onReady}
                    content={[]}
                />
            </TestWrapper>
        );

        setTimeout(() => {
            ee.emit('data', { event: 'eter:join' }, conn);
        }, 100);

        await vi.waitFor(() => {
            expect(conn.send).toHaveBeenCalledWith({
                event: 'eter:config',
                configuration: DEFAULT.configuration,
                content: [],
            });
            expect(conn.send).toHaveBeenCalledWith({ event: 'eter:users', users: [] });
        });
    });
});
