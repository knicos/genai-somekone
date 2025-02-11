import { describe, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import PieScore from './PieScore';

describe('PieScore component', () => {
    it('renders a pie chart', async ({ expect }) => {
        render(<PieScore value={0.4} />);

        const root = screen.getByTestId('pie-score');
        expect(root).toBeInTheDocument();
        expect(root.querySelector('svg')).toBeTruthy();
    });
});
