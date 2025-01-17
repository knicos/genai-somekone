import { beforeEach, describe, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActionLogService, getContentService, GraphService, ProfilerService, ServiceBroker } from '@knicos/genai-recom';
import { defaultServices, ServiceProvider } from '@genaism/hooks/services';
import { MemoryRouter } from 'react-router';
import UserTable from './UserTable';

describe('UserTable component', () => {
    const broker = new ServiceBroker();
    let graph = new GraphService(broker);
    let actionLog = new ActionLogService(broker);
    let profiler = new ProfilerService(broker, graph, getContentService());
    beforeEach(() => {
        actionLog = new ActionLogService(broker);
        graph = new GraphService(broker);
        profiler = new ProfilerService(broker, graph, getContentService());
    });

    it('shows a single users view time', async ({ expect }) => {
        profiler.createUserProfile('user:1', 'TestUser1');
        actionLog.appendActionLog(
            [
                { activity: 'dwell', id: 'content:x', value: 1200, timestamp: 100 },
                { activity: 'dwell', id: 'content:y', value: 1300, timestamp: 100 },
            ],
            'user:1'
        );
        render(
            <MemoryRouter initialEntries={['/dashboard/actionlog']}>
                <ServiceProvider value={{ ...defaultServices, broker, graph, actionLog, profiler }}>
                    <UserTable />
                </ServiceProvider>
            </MemoryRouter>
        );

        expect(await screen.findByText('TestUser1')).toBeVisible();
        expect(screen.getByText('2.5s')).toBeVisible();
    });

    it('shows a single users comment count', async ({ expect }) => {
        profiler.createUserProfile('user:1', 'TestUser1');
        actionLog.appendActionLog(
            [
                { activity: 'comment', id: 'content:x', value: 12, content: 'xxx', timestamp: 100 },
                { activity: 'comment', id: 'content:y', value: 13, content: 'yyy', timestamp: 100 },
            ],
            'user:1'
        );
        render(
            <MemoryRouter initialEntries={['/dashboard/actionlog']}>
                <ServiceProvider value={{ ...defaultServices, broker, graph, actionLog, profiler }}>
                    <UserTable />
                </ServiceProvider>
            </MemoryRouter>
        );

        expect(await screen.findByText('TestUser1')).toBeVisible();
        expect(screen.getByText('2')).toBeVisible();
    });

    it('shows a single users main topic', async ({ expect }) => {
        const profile = profiler.createUserProfile('user:1', 'TestUser1');
        profile.affinities.topics.topics = [
            { label: 'testtopic1', weight: 1 },
            { label: 'testtopic2', weight: 0.5 },
        ];

        render(
            <MemoryRouter initialEntries={['/dashboard/actionlog']}>
                <ServiceProvider value={{ ...defaultServices, broker, graph, actionLog, profiler }}>
                    <UserTable />
                </ServiceProvider>
            </MemoryRouter>
        );

        expect(await screen.findByText('TestUser1')).toBeVisible();
        expect(screen.getByText('testtopic1')).toBeVisible();
    });
});
