import { beforeAll, describe, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import TestWrapper from '@genaism/util/TestWrapper';
import ContentWizard from './ContentWizard';

describe('ContentWizard', () => {
    beforeAll(() => {
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
    });

    it('should render', ({ expect }) => {
        render(
            <TestWrapper>
                <ContentWizard />
            </TestWrapper>
        );

        expect(screen.getByTestId('widget-creator.titles.summary')).toBeVisible();
        expect(screen.getByTestId('widget-creator.titles.embedding')).toBeVisible();
        expect(screen.getByTestId('widget-creator.titles.points')).toBeVisible();
    });
});
