import { LogEntry } from '@genai-fi/recom';
import { TFunction } from 'i18next';

export function generateMessage(log: LogEntry, t: TFunction) {
    switch (log.activity) {
        case 'engagement':
            return t('feed.actionlog.engagement', {
                score: Math.min(10, Math.max(0, (log.value || 0) * 10)).toFixed(),
            });

        case 'inactive':
            return t('feed.actionlog.inactive', { time: ((log.value || 0) / 1000).toFixed(1) });

        case 'dwell':
            return t('feed.actionlog.dwell', { time: ((log.value || 0) / 1000).toFixed(1) });

        case 'comment':
            return t('feed.actionlog.comment', { length: log.value || 0 });

        default:
            return t(`feed.actionlog.${log.activity}`);
    }
}
