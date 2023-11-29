import { getContentData } from '@genaism/services/content/content';
import { LogEntry } from '@genaism/services/profiler/profilerTypes';
import style from './style.module.css';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import relTime from 'dayjs/plugin/relativeTime';
import PieScore from '../PieScore/PieScore';
dayjs.extend(relTime);

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
}

export default function LogItem({ item }: Props) {
    const { t } = useTranslation();

    const isSpecial = item.activity === 'engagement';

    return (
        <tr
            className={isSpecial ? style.engagedItem : style.regularItem}
            data-testid="log-row"
        >
            <td className={style.imageTD}>
                {item.id && (
                    <img
                        width={50}
                        height={50}
                        src={getContentData(item.id)}
                    />
                )}
            </td>
            <td className={isSpecial ? style.special : style.normal}>
                <div>{generateMessage(item, t)}</div>
                {!isSpecial && <div className={style.time}>{dayjs(item.timestamp).fromNow()}</div>}
                {isSpecial && <PieScore value={item.value || 0} />}
            </td>
        </tr>
    );
}
