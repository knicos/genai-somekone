import { beforeEach, describe, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TestWrapper from '@genaism/util/TestWrapper';
import Guidance from './Guidance';
import { GuidanceData } from '@genaism/hooks/guidance';
import userEvent from '@testing-library/user-event';
import { RecoilObserver } from '@genaism/util/RecoilObserver';
import { appConfiguration } from '@genaism/common/state/configState';
import { SMConfig } from '@genaism/common/state/smConfig';
import defaultConfig from '../../../../common/state/defaultConfig.json';
import { useCallback, useState } from 'react';

const { mockGuide, mockNavigate, mockParamsSet, mockZipBlob } = vi.hoisted(() => ({
    mockGuide: vi.fn(
        () =>
            ({
                steps: [],
                name: 'None',
                locales: [],
                actions: {},
            }) as GuidanceData
    ),
    mockNavigate: vi.fn(),
    mockParamsSet: new URLSearchParams(),
    mockZipBlob: vi.fn(() => Promise.resolve(new Blob())),
}));

vi.mock('@genaism/hooks/guidance', () => ({
    useGuide: mockGuide,
}));

vi.mock('react-router', () => ({
    useLocation: () => ({ search: '' }),
    useNavigate: () => mockNavigate,
}));

vi.mock('@genaism/services/loader/fileLoader', () => ({
    getZipBlob: mockZipBlob,
    loadFile: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
    useSearchParams: () => {
        const [p, setP] = useState(mockParamsSet);
        const cb = useCallback((fn: (params: URLSearchParams) => void) => {
            const s = mockParamsSet.toString();
            fn(mockParamsSet);
            const s2 = mockParamsSet.toString();
            if (s !== s2) {
                setP(new URLSearchParams(mockParamsSet));
            }
        }, []);
        return [p, cb];
    },
}));

vi.mock('@knicos/genai-base', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@knicos/genai-base')>()),
    QRCode: function QRCode() {
        return null;
    },
}));

describe('Guidance', () => {
    beforeEach(() => {
        mockParamsSet.set('page', '0');
    });

    it('renders the initial page', async ({ expect }) => {
        render(
            <TestWrapper>
                <Guidance guide="default" />
            </TestWrapper>
        );
        expect(screen.getByTestId('guidance')).toBeVisible();
    });

    it('displays the action steps', async ({ expect }) => {
        mockGuide.mockImplementation(() => ({
            name: 'Test',
            locales: [],
            actions: {
                testact1: {},
            },
            steps: [
                {
                    actions: ['testact1'],
                    title: 'Step1',
                },
                {
                    actions: ['testact2'],
                    title: 'Step2',
                },
            ],
        }));
        render(
            <TestWrapper>
                <Guidance guide="default" />
            </TestWrapper>
        );
        expect(screen.getByText('Step1')).toBeVisible();
        expect(screen.getByText('Step2')).toBeVisible();
    });

    it('can change steps', async ({ expect }) => {
        const user = userEvent.setup();

        mockGuide.mockImplementation(() => ({
            name: 'Test',
            locales: [],
            actions: {
                testact2: {
                    url: '/test2',
                },
            },
            steps: [
                {
                    actions: ['testact1'],
                    title: 'Step1',
                },
                {
                    actions: ['testact2'],
                    title: 'Step2',
                },
            ],
        }));
        render(
            <TestWrapper>
                <Guidance guide="default" />
            </TestWrapper>
        );

        expect(mockParamsSet.get('page')).toBe('0');
        await user.click(screen.getByText('Step2'));
        expect(mockParamsSet.get('page')).toBe('1');
        await vi.waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/test2'));
    });

    it('supports the pause action button', async ({ expect }) => {
        const user = userEvent.setup();

        mockGuide.mockImplementation(() => ({
            name: 'Test',
            locales: [],
            actions: {},
            steps: [
                {
                    actions: ['testact1'],
                    actionButton: 'pause',
                    title: 'Step1',
                },
            ],
        }));

        const settings = vi.fn();

        render(
            <TestWrapper
                initializeState={({ set }) => {
                    set(appConfiguration, defaultConfig.configuration as SMConfig);
                }}
            >
                <RecoilObserver
                    node={appConfiguration}
                    onChange={settings}
                />
                <Guidance guide="default" />
            </TestWrapper>
        );

        await vi.waitFor(() => expect(screen.getByTestId('action-button')).toBeVisible());
        await user.click(screen.getByTestId('action-button'));
        expect(settings).toHaveBeenCalledWith({ ...defaultConfig.configuration, disableFeedApp: true });
        await vi.waitFor(() => expect(screen.getByTestId('paused-app')).toBeVisible());
    });

    it('can load data files', async ({ expect }) => {
        mockGuide.mockImplementation(() => ({
            name: 'Test',
            locales: [],
            actions: {
                testact1: {
                    data: ['testdata1'],
                },
            },
            steps: [
                {
                    actions: ['testact1'],
                    title: 'Step1',
                },
            ],
        }));

        render(
            <TestWrapper
                initializeState={({ set }) => {
                    set(appConfiguration, defaultConfig.configuration as SMConfig);
                }}
            >
                <Guidance guide="default" />
            </TestWrapper>
        );

        await vi.waitFor(() => expect(mockZipBlob).toHaveBeenCalledWith('testdata1'));
    });
});
