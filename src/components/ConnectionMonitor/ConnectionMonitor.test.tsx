import { beforeEach, describe, it, vi } from 'vitest';
import ConnectionMonitor from './ConnectionMonitor';
import TestWrapper from '@genaism/util/TestWrapper';
import { render, screen } from '@testing-library/react';
import { iceConfig, webrtcActive } from '@genaism/state/webrtcState';

const { mockGetRTConfig, mockGetUserMedia } = vi.hoisted(() => ({
    mockGetRTConfig: vi.fn(),
    mockGetUserMedia: vi.fn(),
}));

Object.defineProperty(navigator, 'mediaDevices', {
    value: {
        getUserMedia: mockGetUserMedia,
    },
});

vi.mock('./ice', () => ({
    getRTConfig: mockGetRTConfig,
}));

describe('Connection Monitor Component', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('can get ICE config if missing', async ({ expect }) => {
        render(
            <TestWrapper
                initializeState={({ set }) => {
                    set(webrtcActive, 'full');
                }}
            >
                <ConnectionMonitor ready={false} />
            </TestWrapper>
        );

        expect(mockGetRTConfig).toHaveBeenCalledOnce();
    });

    it('should ask for media permissions', async ({ expect }) => {
        mockGetUserMedia.mockImplementation(async () => ({}));

        render(
            <TestWrapper
                initializeState={({ set }) => {
                    set(webrtcActive, 'unset');
                    set(iceConfig, { expiresOn: new Date(), iceServers: [] });
                }}
            >
                <ConnectionMonitor ready={false} />
            </TestWrapper>
        );

        expect(mockGetUserMedia).toHaveBeenCalledOnce();
    });

    it('displays a progress dialog', async ({ expect }) => {
        render(
            <TestWrapper
                initializeState={({ set }) => {
                    set(webrtcActive, 'full');
                    set(iceConfig, { expiresOn: new Date(), iceServers: [] });
                }}
            >
                <ConnectionMonitor
                    ready={false}
                    status={'connecting'}
                />
            </TestWrapper>
        );

        expect(screen.getByText('loader.messages.connecting')).toBeVisible();
    });

    it('displays an error dialog', async ({ expect }) => {
        render(
            <TestWrapper
                initializeState={({ set }) => {
                    set(webrtcActive, 'full');
                    set(iceConfig, { expiresOn: new Date(), iceServers: [] });
                }}
            >
                <ConnectionMonitor
                    ready={false}
                    status={'failed'}
                    error="peer-not-found"
                />
            </TestWrapper>
        );

        expect(screen.getByText('loader.errors.peer-not-found')).toBeVisible();
    });
});
