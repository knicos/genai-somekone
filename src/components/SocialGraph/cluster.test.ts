import { describe, it, vi } from 'vitest';
import { assignToCluster, clusterMean, clusterUsers } from './cluster';
import { UserNodeId } from '@genaism/services/graph/graphTypes';

const { mockProfile } = vi.hoisted(() => ({
    mockProfile: vi.fn(),
}));

vi.mock('@genaism/services/profiler/profiler', () => ({
    getUserProfile: mockProfile,
}));

describe('clusterMean()', () => {
    it('works with no members', async ({ expect }) => {
        const mean = clusterMean([]);
        expect(mean).toBeInstanceOf(Map);
    });

    it('works with one member', async ({ expect }) => {
        mockProfile.mockImplementationOnce(() => ({
            taste: [
                { label: 'label1', weight: 0.5 },
                { label: 'label2', weight: 0.1 },
            ],
        }));
        const mean = clusterMean(['user:xyz']);
        expect(mean.get('label1')).toBe(0.5);
        expect(mean.get('label2')).toBe(0.1);
    });

    it('averages multiple members with the same labels', async ({ expect }) => {
        mockProfile.mockImplementation((id: UserNodeId) =>
            id === 'user:xyz'
                ? {
                      taste: [
                          { label: 'label1', weight: 0.5 },
                          { label: 'label2', weight: 0.1 },
                      ],
                  }
                : {
                      taste: [
                          { label: 'label1', weight: 0.5 },
                          { label: 'label2', weight: 0.2 },
                      ],
                  }
        );
        const mean = clusterMean(['user:xyz', 'user:www']);
        expect(mean.get('label1')).toBeCloseTo(0.5);
        expect(mean.get('label2')).toBeCloseTo(0.15);
    });

    it('averages multiple members with non overlapping labels', async ({ expect }) => {
        mockProfile.mockImplementation((id: UserNodeId) =>
            id === 'user:xyz'
                ? {
                      taste: [
                          { label: 'label1', weight: 0.5 },
                          { label: 'label2', weight: 0.1 },
                      ],
                  }
                : {
                      taste: [
                          { label: 'label3', weight: 0.4 },
                          { label: 'label2', weight: 0.2 },
                      ],
                  }
        );
        const mean = clusterMean(['user:xyz', 'user:www']);
        expect(mean.get('label1')).toBeCloseTo(0.25);
        expect(mean.get('label2')).toBeCloseTo(0.15);
        expect(mean.get('label3')).toBeCloseTo(0.2);
    });
});

describe('assignToCluster()', () => {
    it('assigns user to one cluster', async ({ expect }) => {
        mockProfile.mockImplementationOnce(() => ({
            name: 'testuser',
            taste: [{ label: 'label1', weight: 0.2 }],
        }));
        const c1 = new Map<string, number>();
        c1.set('label1', 0.5);
        const cluster = assignToCluster([c1], 'user:xyz');
        expect(cluster).toBe(0);
    });

    it('assigns closest cluster', async ({ expect }) => {
        mockProfile.mockImplementationOnce(() => ({
            name: 'testuser',
            taste: [
                { label: 'label2', weight: 0.18 },
                { label: 'label1', weight: 0.1 },
            ],
        }));
        const c1 = new Map<string, number>();
        c1.set('label1', 0.5);
        const c2 = new Map<string, number>();
        c2.set('label2', 0.5);
        const c3 = new Map<string, number>();
        c3.set('label3', 0.8);

        const cluster = assignToCluster([c1, c2, c3], 'user:xyz');
        expect(cluster).toBe(1);
    });
});

describe('clusterUsers()', () => {
    it('clusters no users', async ({ expect }) => {
        const result = clusterUsers([], 4);
        expect(result).toBeInstanceOf(Map);
        expect(result.size).toBe(0);
    });

    it('clusters one user', async ({ expect }) => {
        mockProfile.mockImplementationOnce(() => ({
            name: 'testuser',
            taste: [
                { label: 'label1', weight: 0.2 },
                { label: 'label2', weight: 0.1 },
            ],
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
                taste: [
                    { label: 'label1', weight: 0.5 },
                    { label: 'label2', weight: 0.3 },
                ],
            },
            'user:test2': {
                name: 'test2',
                taste: [
                    { label: 'label1', weight: 0.4 },
                    { label: 'label2', weight: 0.1 },
                ],
            },
            'user:test3': {
                name: 'test3',
                taste: [
                    { label: 'label2', weight: 0.5 },
                    { label: 'label1', weight: 0.2 },
                ],
            },
            'user:test4': {
                name: 'test4',
                taste: [
                    { label: 'label2', weight: 0.45 },
                    { label: 'label1', weight: 0.1 },
                ],
            },
        };
        mockProfile.mockImplementation((id: keyof typeof profiles) => profiles[id]);
        const result = clusterUsers(['user:test1', 'user:test2', 'user:test3', 'user:test4'], 2);
        expect(result).toBeInstanceOf(Map);
        expect(result.size).toBe(4);
        expect(result.get('user:test1')?.label).toBe('cluster1');
        expect(result.get('user:test2')?.label).toBe('cluster1');
        expect(result.get('user:test3')?.label).toBe('cluster0');
        expect(result.get('user:test4')?.label).toBe('cluster0');
    });
});
