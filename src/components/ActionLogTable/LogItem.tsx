import { LogEntry } from '@genaism/services/profiler/profilerTypes';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import TableItem from '../Table/TableItem';

function generateMessage(log: LogEntry, t: TFunction) {
    switch (log.activity) {
        case 'engagement':
            return t('feed.actionlog.engagement', { score: Math.min(10, (log.value || 0) * 10).toFixed() });

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

interface Props {
    item: LogEntry;
    first: boolean;
}

export default function LogItem({ item, first }: Props) {
    const { t } = useTranslation();

    const isSpecial = item.activity === 'engagement';

    return (
        <TableItem
            message={generateMessage(item, t)}
            image={first ? item.id : undefined}
            time={isSpecial ? undefined : item.timestamp}
            score={isSpecial ? item.value || 0 : undefined}
            highlight={first}
        />
    );
}
