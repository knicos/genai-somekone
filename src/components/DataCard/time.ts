import dayjs from 'dayjs';
import relTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relTime);

export function timeAgo(time: number) {
    return dayjs(time).fromNow();
}
