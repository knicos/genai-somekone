import { describe, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import ImageCloud from './ImageCloud';

const TEST_IMAGE = 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg';

describe('ImageCloud component', () => {
    it('renders with no content', async ({ expect }) => {
        render(
            <svg>
                <ImageCloud content={[]} />
            </svg>
        );

        expect(screen.getByTestId('cloud-group')).toBeInTheDocument();
    });

    it('renders with one item', async ({ expect }) => {
        render(
            <svg>
                <ImageCloud content={[{ image: TEST_IMAGE, weight: 1 }]} />
            </svg>
        );

        expect(screen.getAllByTestId('cloud-image')).toHaveLength(1);
    });

    it('renders with three items', async ({ expect }) => {
        render(
            <svg>
                <ImageCloud
                    content={[
                        { image: TEST_IMAGE, weight: 1 },
                        { image: TEST_IMAGE, weight: 0.2 },
                        { image: TEST_IMAGE, weight: 0.5 },
                    ]}
                />
            </svg>
        );

        expect(screen.getAllByTestId('cloud-image')).toHaveLength(3);
    });
});
