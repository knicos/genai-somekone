import { TestWrapper } from '@knicos/genai-base';
import { describe, it, vi } from 'vitest';
import ImageEdit from './ImageEdit';
import { render, screen, waitFor } from '@testing-library/react';
import { ServiceProvider } from '@genaism/hooks/services';
import {
    ActionLogService,
    ContentService,
    GraphService,
    ProfilerService,
    RecommenderService,
    ReplayService,
    ServiceBroker,
} from '@knicos/genai-recom';

const { mockEncode, mockSimilar } = vi.hoisted(() => ({
    mockEncode: vi.fn(() => [1, 1, 1]),
    mockSimilar: vi.fn(() => [
        { id: 'content:1', weight: 1 },
        { id: 'content:2', weight: 0.5 },
    ]),
}));

vi.mock('@knicos/genai-recom', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@knicos/genai-recom')>()),
    ContentService: vi.fn(() => ({
        hasEncoder: () => true,
        createEmbedding: mockEncode,
        getSimilarContent: mockSimilar,
        getContentMetadata: () => ({
            labels: [
                { label: 'label1', weight: 1 },
                { label: 'label2', weight: 0.5 },
            ],
        }),
    })),
}));

describe('ImageEdit component', () => {
    it('renders the image and tags', async ({ expect }) => {
        const broker = new ServiceBroker();
        const graph = new GraphService(broker);
        const content = new ContentService(broker, graph);
        const profiler = new ProfilerService(broker, graph, content);
        const actionLog = new ActionLogService(broker);
        const recommender = new RecommenderService(broker, graph, content, profiler);
        const replay = new ReplayService(profiler, content, actionLog);

        const doneFn = vi.fn();
        render(
            <TestWrapper>
                <ServiceProvider
                    value={{
                        broker,
                        graph,
                        content,
                        profiler,
                        actionLog,
                        recommender,
                        replay,
                    }}
                >
                    <ImageEdit
                        image="https://store.gen-ai.fi/somekone/images/pixabay-8165380.jpg"
                        onDone={doneFn}
                        onCancel={doneFn}
                    />
                </ServiceProvider>
            </TestWrapper>
        );

        expect(mockEncode).toHaveBeenCalledWith('https://store.gen-ai.fi/somekone/images/pixabay-8165380.jpg');
        expect(mockSimilar).toHaveBeenCalledOnce();
        waitFor(() => {
            expect(screen.getByText('#label1')).toBeVisible();
        });
    });
});
