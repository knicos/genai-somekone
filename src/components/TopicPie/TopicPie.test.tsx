import { describe, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import TopicPie from './TopicPie';

describe('PieScore component', () => {
    it('renders with no data', async ({ expect }) => {
        render(
            <TopicPie
                title="testtitle"
                summary={[]}
            />
        );
        expect(screen.queryByText('testtitle')).not.toBeInTheDocument();
    });

    it('renders with one item', async ({ expect }) => {
        render(
            <TopicPie
                title="testtitle"
                summary={[{ label: 'topic1', percent: 0.5, total: 1, count: 1 }]}
            />
        );
        expect(screen.getByText('testtitle')).toBeInTheDocument();
        expect(screen.getAllByText('topic1')[0]).toBeVisible();
    });

    it('limits the items rendered', async ({ expect }) => {
        render(
            <TopicPie
                title="testtitle"
                summary={[
                    { label: 'topic1', percent: 0.1, total: 1, count: 1 },
                    { label: 'topic2', percent: 0.1, total: 1, count: 1 },
                    { label: 'topic3', percent: 0.1, total: 1, count: 1 },
                    { label: 'topic4', percent: 0.1, total: 1, count: 1 },
                    { label: 'topic5', percent: 0.1, total: 1, count: 1 },
                    { label: 'topic6', percent: 0.1, total: 1, count: 1 },
                    { label: 'topic7', percent: 0.1, total: 1, count: 1 },
                    { label: 'topic8', percent: 0.1, total: 1, count: 1 },
                ]}
            />
        );
        expect(screen.getByText('testtitle')).toBeInTheDocument();
        expect(screen.getByText('topic1')).toBeInTheDocument();
        expect(screen.getByText('topic2')).toBeInTheDocument();
        expect(screen.getByText('topic3')).toBeInTheDocument();
        expect(screen.getByText('topic4')).toBeInTheDocument();
        expect(screen.getAllByText('topic5')[0]).toBeInTheDocument();
        expect(screen.queryByText('topic6')).not.toBeInTheDocument();
    });
});
