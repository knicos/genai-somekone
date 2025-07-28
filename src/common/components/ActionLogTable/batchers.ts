import { engagementFromLog } from '@genai-fi/recom';
import { ContentLogEntry } from './LogBatch';

export function batchLogs(log: ContentLogEntry[], oldBatch: ContentLogEntry[][]): ContentLogEntry[][] {
    const results: ContentLogEntry[][] = [[]];
    if (log.length === 0) return results;

    let doEnd = false;
    for (let i = 0; i < log.length; ++i) {
        const l = log[i];

        const current = results[results.length - 1];

        if (current.length > 0 && current[0].entry.id !== l.entry.id) {
            if (doEnd) {
                results.push(...oldBatch.slice(1));
                break;
            }
            results.push([l]);
        } else {
            current.push(l);
        }

        const batch = oldBatch[0];
        const bend = batch?.length - 1;
        if (
            batch &&
            batch.length > 0 &&
            l.entry.id === batch[bend].entry.id &&
            l.entry.timestamp === batch[bend].entry.timestamp
        ) {
            doEnd = true;
        }
    }

    // The first result may not have engagement
    if (log[0].entry.activity !== 'engagement') {
        const weight = engagementFromLog(results[0].map((l) => l.entry));
        results[0].unshift({
            entry: {
                activity: 'engagement',
                timestamp: log[0].entry.timestamp,
                value: weight,
                id: log[0].entry.id,
            },
            content: log[0].content,
        });
    }

    return results;
}
