import { beforeEach, describe, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import LogTable from './LogTable';
import { ActionLogService, getContentService, GraphService, ProfilerService, ServiceBroker } from '@genai-fi/recom';
import { defaultServices, ServiceProvider } from '@genaism/hooks/services';
import { MemoryRouter } from 'react-router-dom';

describe('LogTable component', () => {
    const broker = new ServiceBroker();
    let graph = new GraphService(broker);
    let actionLog = new ActionLogService(broker);
    let profiler = new ProfilerService(broker, graph, getContentService());
    beforeEach(() => {
        actionLog = new ActionLogService(broker);
        graph = new GraphService(broker);
        profiler = new ProfilerService(broker, graph, getContentService());
    });

    it('shows a single dwell item', async ({ expect }) => {
        profiler.createUserProfile('user:1', 'TestUser1');
        actionLog.appendActionLog([{ activity: 'dwell', id: 'content:x', value: 1200, timestamp: 100 }], 'user:1');
        render(
            <MemoryRouter initialEntries={['/dashboard/actionlog']}>
                <ServiceProvider value={{ ...defaultServices, broker, graph, actionLog, profiler }}>
                    <LogTable />
                </ServiceProvider>
            </MemoryRouter>
        );

        expect(await screen.findByText('TestUser1')).toBeVisible();
        expect(screen.getByText('dwell')).toBeVisible();
        expect(screen.getByText('1.2s')).toBeVisible();
    });
});
