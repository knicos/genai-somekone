import { describe, it } from 'vitest';
import { ContentLogEntry } from './LogBatch';
import { batchLogs } from './batchers';

describe('batchLogs()', () => {
    it('returns the old log if no changes', async ({ expect }) => {
        const log: ContentLogEntry[] = [
            { content: 'content:1', entry: { id: 'content:1', activity: 'engagement', value: 1, timestamp: 1000 } },
            { content: 'content:1', entry: { id: 'content:1', activity: 'dwell', value: 1, timestamp: 999 } },
            { content: 'content:2', entry: { id: 'content:2', activity: 'engagement', value: 1, timestamp: 998 } },
            { content: 'content:2', entry: { id: 'content:2', activity: 'dwell', value: 1, timestamp: 997 } },
        ];

        const b1 = batchLogs(log, []);
        const b2 = batchLogs(log, b1);
        expect(b2).toHaveLength(b1.length);
        expect(b1).toHaveLength(2);
        expect(b2[0][0].entry).toBe(b1[0][0].entry);
        expect(b2).toStrictEqual(b1);
    });

    it('only adds new items', async ({ expect }) => {
        const log1: ContentLogEntry[] = [
            { content: 'content:2', entry: { id: 'content:2', activity: 'engagement', value: 1, timestamp: 998 } },
            { content: 'content:2', entry: { id: 'content:2', activity: 'dwell', value: 1, timestamp: 997 } },
        ];
        const log2: ContentLogEntry[] = [
            { content: 'content:1', entry: { id: 'content:1', activity: 'engagement', value: 1, timestamp: 1000 } },
            { content: 'content:1', entry: { id: 'content:1', activity: 'dwell', value: 1, timestamp: 999 } },
            ...log1,
        ];

        const b1 = batchLogs(log1, []);
        const b2 = batchLogs(log2, b1);
        expect(b2).toHaveLength(2);
        expect(b1).toHaveLength(1);
        expect(b2[1][0].entry).toBe(b1[0][0].entry);
        expect(b2[1]).toStrictEqual(b1[0]);
    });
});
