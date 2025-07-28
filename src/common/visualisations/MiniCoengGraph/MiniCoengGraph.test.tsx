import TestWrapper from '@genaism/util/TestWrapper';
import { describe, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { getGraphService } from '@genai-fi/recom';
import MiniCoengGraph from './MiniCoengGraph';

describe('MiniCoengGraph Component', () => {
    it('should render correctly', ({ expect }) => {
        const graphSvc = getGraphService();
        graphSvc.reset();

        graphSvc.addNode('user', 'user:1');
        graphSvc.addNode('content', 'content:1');
        graphSvc.addNode('content', 'content:2');
        render(
            <TestWrapper>
                <MiniCoengGraph
                    userId="user:1"
                    contentId="content:1"
                    originId="content:2"
                />
            </TestWrapper>
        );

        expect(screen.getByTestId('graph-svg')).toBeVisible();
    });
});
