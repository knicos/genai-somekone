import { describe, it, vi } from 'vitest';
import { clusterUsers } from './user';
import { normalise } from '@genaism/util/embedding';

const { mockProfile } = vi.hoisted(() => ({
    mockProfile: vi.fn(),
}));

vi.mock('@genaism/services/profiler/profiler', () => ({
    getUserProfile: mockProfile,
}));

describe('clusterUsers()', () => {
    it('clusters no users', async ({ expect }) => {
        const result = clusterUsers([], 4);
        expect(result).toBeInstanceOf(Map);
        expect(result.size).toBe(0);
    });

    it('clusters one user', async ({ expect }) => {
        mockProfile.mockImplementationOnce(() => ({
            name: 'testuser',
            embeddings: { taste: normalise([0.2, 0.1]) },
        }));
        const result = clusterUsers(['user:xyz'], 4);
        expect(result).toBeInstanceOf(Map);
        expect(result.size).toBe(1);
        expect(result.get('user:xyz')?.label).toBe('cluster0');
    });

    it('clusters many users', async ({ expect }) => {
        const profiles = {
            'user:test1': {
                name: 'test1',
                embeddings: { taste: normalise([0.5, 0.1]) },
            },
            'user:test2': {
                name: 'test2',
                embeddings: { taste: normalise([0.6, 0.2]) },
            },
            'user:test3': {
                name: 'test3',
                embeddings: { taste: normalise([0.2, 0.5]) },
            },
            'user:test4': {
                name: 'test4',
                embeddings: { taste: normalise([0.1, 0.4]) },
            },
        };
        mockProfile.mockImplementation((id: keyof typeof profiles) => profiles[id]);
        const result = clusterUsers(['user:test1', 'user:test2', 'user:test3', 'user:test4'], 2);
        expect(result).toBeInstanceOf(Map);
        expect(result.size).toBe(4);
        expect(result.get('user:test1')?.label).toBe('cluster0');
        expect(result.get('user:test2')?.label).toBe('cluster0');
        expect(result.get('user:test3')?.label).toBe('cluster1');
        expect(result.get('user:test4')?.label).toBe('cluster1');
    });
});
