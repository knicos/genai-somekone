import { LogEntry } from '@genaism/services/profiler/profilerTypes';
import { useTranslation } from 'react-i18next';
import { generateMessage } from './message';
import style from './style.module.css';
import { timeAgo } from '../DataCard/time';

interface Props {
    item: LogEntry;
}

export default function LogItem({ item }: Props) {
    const { t } = useTranslation();

    return (
        <div
            className={style.logItem}
            data-testid="log-item"
        >
            <div>{generateMessage(item, t)}</div>
            <div className={style.time}>{timeAgo(item.timestamp)}</div>
        </div>
    );
}
