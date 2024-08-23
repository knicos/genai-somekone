import { generateMessage } from './message';
import { useTranslation } from 'react-i18next';
import Card from '../DataCard/Card';
import LogItem from './LogItem';
import { LogEntry } from '@knicos/genai-recom';

export interface ContentLogEntry {
    content: string;
    entry: LogEntry;
}

interface Props {
    batch: ContentLogEntry[];
}

export default function LogBatch({ batch }: Props) {
    const { t } = useTranslation();
    if (batch.length === 0) return null;

    const message = generateMessage(batch[0].entry, t);

    const image = batch[0].content;

    return (
        <Card
            message={message}
            image={image}
        >
            {batch.slice(1).map((item, ix) => (
                <LogItem
                    item={item.entry}
                    key={ix}
                />
            ))}
        </Card>
    );
}
