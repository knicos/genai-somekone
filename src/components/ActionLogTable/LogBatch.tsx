import { LogEntry } from '@genaism/services/users/userTypes';
import { generateMessage } from './message';
import { useTranslation } from 'react-i18next';
import Card from '../DataCard/Card';
import LogItem from './LogItem';

interface Props {
    batch: LogEntry[];
}

export default function LogBatch({ batch }: Props) {
    const { t } = useTranslation();
    if (batch.length === 0) return null;

    const message = generateMessage(batch[0], t);

    const image = batch[0].id || 'content:unknown';

    return (
        <Card
            message={message}
            image={image}
        >
            {batch.slice(1).map((item, ix) => (
                <LogItem
                    item={item}
                    key={ix}
                />
            ))}
        </Card>
    );
}
