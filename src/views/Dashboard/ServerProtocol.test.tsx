import { beforeEach, describe, it, vi } from 'vitest';
import ServerProtocol from './ServerProtocol';
import { render } from '@testing-library/react';
import TestWrapper from '@genaism/util/TestWrapper';

const { mockPeer } = vi.hoisted(() => ({
    mockPeer: vi.fn(),
}));

vi.mock('@genaism/hooks/peer', () => ({
    default: mockPeer,
}));

describe('ServerProtocol Component', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('responds with ready if connected', async ({ expect }) => {
        mockPeer.mockImplementation(() => ({
            ready: true,
        }));
        const onReady = vi.fn();
        render(
            <TestWrapper>
                <ServerProtocol
                    onReady={onReady}
                    code="xyz"
                    content={[]}
                />
            </TestWrapper>
        );

        expect(mockPeer).toHaveBeenCalled();
        expect(onReady).toHaveBeenCalled();
    });

    it('responds correctly to a new connection', async ({ expect }) => {
        const conn = {
            send: vi.fn(),
        };
        mockPeer.mockImplementation(({ onData }) => {
            onData({ event: 'eter:join' }, conn);
            return { ready: true };
        });

        const onReady = vi.fn();
        render(
            <TestWrapper>
                <ServerProtocol
                    onReady={onReady}
                    code="xyz"
                    content={[]}
                />
            </TestWrapper>
        );

        expect(conn.send).toHaveBeenCalledWith({ event: 'eter:config', configuration: undefined, content: [] });
        expect(conn.send).toHaveBeenCalledWith({ event: 'eter:users', users: [] });
    });
});
