import style from './style.module.css';
import ActionPanel from './ActionPanel';
import { localiser } from '@genaism/services/localiser/localiser';
import { useTranslation } from 'react-i18next';

export type ShareKind = 'none' | 'individual' | 'friends' | 'public';

interface Props {
    onClose?: () => void;
    labels: string[];
}

export default function LabelsPanel({ onClose, labels }: Props) {
    const { i18n } = useTranslation();
    return (
        <ActionPanel
            horizontal="right"
            vertical="top"
            onClose={onClose}
        >
            <div
                className={style.labelcontainer}
                data-testid="feed-image-label-panel"
            >
                {labels.slice(0, 5).map((l, ix) => (
                    <div
                        key={ix}
                        className={style.topicLabel}
                    >
                        #{localiser.getLocalisedLabel(l, i18n.language)}
                    </div>
                ))}
            </div>
        </ActionPanel>
    );
}
