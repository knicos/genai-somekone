import { beforeEach, describe, it, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { getGraphService, getProfilerService } from '@knicos/genai-recom';
import { TestWrapper } from '@knicos/genai-base';
import Workflow from './Workflow';
import { appConfiguration } from '@genaism/common/state/configState';

describe('Workflow component', () => {
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
    beforeEach(() => {
        getGraphService().reset();
        getProfilerService().reset();
    });

    it('renders the full workflow', async ({ expect }) => {
        const profiler = getProfilerService();
        profiler.createUserProfile('user:xyz', 'TestUser');
        render(<Workflow id="user:xyz" />, { wrapper: TestWrapper });
        expect(screen.getByText('workflow.titles.data')).toBeVisible();
        expect(screen.getByText('workflow.titles.cluster')).toBeVisible();
        expect(screen.getByText('workflow.titles.profile')).toBeVisible();
        expect(screen.getByText('workflow.titles.map')).toBeVisible();
    });

    it('renders a blackbox', async ({ expect }) => {
        const profiler = getProfilerService();
        profiler.createUserProfile('user:xyz', 'TestUser');
        render(
            <TestWrapper
                initializeState={({ set }) => {
                    set(appConfiguration, (p) => ({ ...p, blackboxWorkflow: true }));
                }}
            >
                <Workflow id="user:xyz" />
            </TestWrapper>
        );
        expect(screen.queryByText('workflow.titles.data')).toBeFalsy();
        expect(screen.getByText('workflow.titles.map')).toBeVisible();
    });
});
