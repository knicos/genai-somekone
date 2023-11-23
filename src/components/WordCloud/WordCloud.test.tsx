import { describe, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import WordCloud from './WordCloud';

describe('WordCloud component', () => {
    it('renders with no content', async ({ expect }) => {
        render(
            <svg>
                <WordCloud content={[]} />
            </svg>
        );

        expect(screen.getByTestId('cloud-group')).toBeInTheDocument();
    });

    it('renders with one item', async ({ expect }) => {
        render(
            <svg>
                <WordCloud content={[{ label: 'topic1', weight: 1 }]} />
            </svg>
        );

        expect(screen.getAllByTestId('cloud-image')).toHaveLength(1);
        expect(screen.getByText('topic1')).toBeVisible();
    });

    it('renders with three items', async ({ expect }) => {
        render(
            <svg>
                <WordCloud
                    content={[
                        { label: 'topic1', weight: 1 },
                        { label: 'topic2', weight: 0.2 },
                        { label: 'topic3', weight: 0.5 },
                    ]}
                />
            </svg>
        );

        expect(screen.getAllByTestId('cloud-image')).toHaveLength(3);
        expect(screen.getByText('topic1')).toBeVisible();
        expect(screen.getByText('topic2')).toBeVisible();
        expect(screen.getByText('topic3')).toBeVisible();
    });
});
