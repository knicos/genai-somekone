import { beforeEach, describe, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
    ActionLogService,
    ContentService,
    getContentService,
    GraphService,
    ProfilerService,
    ServiceBroker,
} from '@genai-fi/recom';
import { defaultServices, ServiceProvider } from '@genaism/hooks/services';
import { MemoryRouter } from 'react-router-dom';
import ContentEngagements from './ContentEngagements';

describe('ContentEngagements component', () => {
    const broker = new ServiceBroker();
    let graph = new GraphService(broker);
    let actionLog = new ActionLogService(broker);
    let profiler = new ProfilerService(broker, graph, getContentService());
    let content = new ContentService(broker, graph);
    beforeEach(() => {
        actionLog = new ActionLogService(broker);
        graph = new GraphService(broker);
        profiler = new ProfilerService(broker, graph, getContentService());
        content = new ContentService(broker, graph);
    });

    it('displays content engagement value', async ({ expect }) => {
        profiler.createUserProfile('user:1', 'TestUser1');
        content.addContent('https://something.fi/x', { id: '1', labels: [] });
        actionLog.appendActionLog([{ activity: 'engagement', id: 'content:1', value: 0.8, timestamp: 100 }], 'user:1');
        render(
            <MemoryRouter initialEntries={['/dashboard/contentengage']}>
                <ServiceProvider value={{ ...defaultServices, content, broker, graph, actionLog, profiler }}>
                    <ContentEngagements />
                </ServiceProvider>
            </MemoryRouter>
        );

        expect(await screen.findByText('TestUser1')).toBeVisible();
        expect(screen.getByText('0.8')).toBeVisible();
    });
});
