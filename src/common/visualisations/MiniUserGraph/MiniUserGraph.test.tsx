import TestWrapper from '@genaism/util/TestWrapper';
import { describe, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createEmptyProfile, getGraphService, UserNodeData } from '@knicos/genai-recom';
import MiniUserGraph from './MiniUserGraph';

describe('MiniUserGraph Component', () => {
    it('should render correctly', ({ expect }) => {
        const graphSvc = getGraphService();
        graphSvc.reset();
        const testProfile: UserNodeData = {
            ...createEmptyProfile('user:1', 'Test User'),
            embeddings: {
                type: 'taste',
                taste: [0, 0, 0],
            },
        };
        graphSvc.addNode('user', 'user:1', { ...testProfile, name: 'User 1', id: 'user:1' });
        graphSvc.addNode('user', 'user:2', { ...testProfile, name: 'User 2', id: 'user:2' });
        graphSvc.addNode('content', 'content:1');
        render(
            <TestWrapper>
                <MiniUserGraph
                    userId="user:1"
                    pairedId="user:2"
                    contentId="content:1"
                />
            </TestWrapper>
        );

        expect(screen.getByTestId('graph-svg')).toBeVisible();
    });
});
