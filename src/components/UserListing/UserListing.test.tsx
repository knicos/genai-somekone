import { getProfilerService } from '@knicos/genai-recom';
import { render, screen } from '@testing-library/react';
import { describe, it } from 'vitest';
import UserListing from './UserListing';

describe('UserListing component', () => {
    it('displays all users in the system', async ({ expect }) => {
        const profilerSvc = getProfilerService();
        const p1 = profilerSvc.createUserProfile('user:1', 'Test1');
        p1.embeddings.taste = [1];
        const p2 = profilerSvc.createUserProfile('user:2', 'Test2');
        p2.embeddings.taste = [1];
        const p3 = profilerSvc.createUserProfile('user:3', 'Test3');
        p3.embeddings.taste = [1];

        render(<UserListing onSelect={() => {}} />);

        expect(screen.getByLabelText('Test1')).toBeVisible();
        expect(screen.getByLabelText('Test2')).toBeVisible();
        expect(screen.getByLabelText('Test3')).toBeVisible();
    });
});
