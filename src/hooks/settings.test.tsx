import { describe, it } from 'vitest';
import { SomekoneSettings, useSettingDeserialise, useSettingSerialise } from './settings';
import TestWrapper from '@genaism/util/TestWrapper';
import { render, waitFor } from '@testing-library/react';
import { useEffect } from 'react';

describe('Settings hooks', () => {
    it('can deserialise and re serialise', async ({ expect }) => {
        const result: { settings: SomekoneSettings | undefined } = { settings: undefined };

        const TestComponent = () => {
            const deserial = useSettingDeserialise();
            const serial = useSettingSerialise();

            useEffect(() => {
                deserial({
                    socialGraph: {
                        clusterColouring: 5,
                        linkDistanceScale: 1,
                        nodeDisplay: 'word',
                    },
                    ui: {
                        showShareCode: true,
                    },
                });

                serial().then((r) => {
                    result.settings = r;
                });
            }, [deserial, serial]);

            return null;
        };

        render(
            <TestWrapper>
                <TestComponent />
            </TestWrapper>
        );

        await waitFor(() => result !== undefined);

        expect(result.settings?.socialGraph?.clusterColouring).toBe(5);
        expect(result.settings?.socialGraph?.nodeDisplay).toBe('word');
        expect(result.settings?.ui?.showShareCode).toBe(true);
    });
});
