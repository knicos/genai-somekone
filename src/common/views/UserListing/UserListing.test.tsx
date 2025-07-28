import { getProfilerService } from '@genai-fi/recom';
import { render, screen } from '@testing-library/react';
import { describe, it, vi } from 'vitest';
import UserListing from './UserListing';
import userEvent from '@testing-library/user-event';
import { getSimilarityService } from '@genaism/services/similarity';

describe('UserListing component', () => {
    it('displays all users in the system', async ({ expect }) => {
        const profilerSvc = getProfilerService();
        profilerSvc.reset();
        profilerSvc.graph.reset();
        const p1 = profilerSvc.createUserProfile('user:1', 'Test1');
        p1.embeddings.taste = [1];
        const p2 = profilerSvc.createUserProfile('user:2', 'Test2');
        p2.embeddings.taste = [1];
        const p3 = profilerSvc.createUserProfile('user:3', 'Test3');
        p3.embeddings.taste = [1];

        render(<UserListing onSelect={() => {}} />);

        expect(await screen.findByLabelText('Test1')).toBeVisible();
        expect(screen.getByLabelText('Test2')).toBeVisible();
        expect(screen.getByLabelText('Test3')).toBeVisible();
    });

    it('can select multiple', async ({ expect }) => {
        const user = userEvent.setup();
        const profilerSvc = getProfilerService();
        profilerSvc.reset();
        profilerSvc.graph.reset();
        const p1 = profilerSvc.createUserProfile('user:1', 'Test1');
        p1.embeddings.taste = [1];
        const p2 = profilerSvc.createUserProfile('user:2', 'Test2');
        p2.embeddings.taste = [1];
        const p3 = profilerSvc.createUserProfile('user:3', 'Test3');
        p3.embeddings.taste = [1];

        const simService = getSimilarityService();
        simService.reset();

        const select = vi.fn();

        render(
            <UserListing
                onSelect={select}
                multiple={true}
            />
        );

        await user.click(await screen.findByLabelText('Test1'));
        await user.click(screen.getByLabelText('Test3'));
        await user.click(screen.getByTestId('user-select-button'));
        expect(select).toHaveBeenCalledWith(['user:1', 'user:3']);
    });
});
