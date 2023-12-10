import { describe, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ImageCloud from './ImageCloud';
import { addContent, resetContent } from '@genaism/services/content/content';

describe('ImageCloud component', () => {
    beforeEach(() => resetContent());

    it('renders with no content', async ({ expect }) => {
        render(
            <svg>
                <ImageCloud content={[]} />
            </svg>
        );

        expect(screen.getByTestId('cloud-group')).toBeInTheDocument();
    });

    it('renders with one item', async ({ expect }) => {
        addContent('https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg', {
            id: 'image1',
            author: 'Unknown',
            labels: [],
        });

        render(
            <svg>
                <ImageCloud content={[{ id: 'content:image1', weight: 1 }]} />
            </svg>
        );

        expect(screen.getAllByTestId('cloud-image')).toHaveLength(1);
    });

    it('renders with three items', async ({ expect }) => {
        addContent('https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg', {
            id: 'image1',
            author: 'Unknown',
            labels: [],
        });

        render(
            <svg>
                <ImageCloud
                    content={[
                        { id: 'content:image1', weight: 1 },
                        { id: 'content:image1', weight: 0.2 },
                        { id: 'content:image1', weight: 0.5 },
                    ]}
                />
            </svg>
        );

        expect(screen.getAllByTestId('cloud-image')).toHaveLength(3);
    });
});
