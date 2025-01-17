import { describe, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import Heatmap from './Heatmap';

describe('Heatmap Component', () => {
    it('shows spinner if no data', async ({ expect }) => {
        render(
            <Heatmap
                dimensions={3}
                data={[]}
            />
        );
        expect(screen.getByTestId('loading-heatmap')).toBeVisible();
    });

    it('shows spinner if busy', async ({ expect }) => {
        render(
            <Heatmap
                dimensions={3}
                data={[{ id: 'content:1', weight: 0.3 }]}
                busy
            />
        );
        expect(screen.getByTestId('loading-heatmap')).toBeVisible();
    });

    it('renders an svg grid with one data item', async ({ expect }) => {
        render(
            <Heatmap
                dimensions={3}
                data={[{ id: 'content:1', weight: 0.3 }]}
            />
        );
        expect(screen.getByTestId('heatmap-image')).toBeVisible();
    });

    it('renders many images in a grid', async ({ expect }) => {
        render(
            <Heatmap
                dimensions={5}
                data={[
                    { id: 'content:1', weight: 0.3 },
                    { id: 'content:2', weight: 0.2 },
                    { id: 'content:3', weight: 0.7 },
                ]}
            />
        );
        expect(screen.getAllByTestId('heatmap-image')).toHaveLength(3);
    });
});
