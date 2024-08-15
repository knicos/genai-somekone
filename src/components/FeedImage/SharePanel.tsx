import { useCallback } from 'react';
import style from './style.module.css';
import ActionPanel from './ActionPanel';
import { useTranslation } from 'react-i18next';
import UserListing from '../UserListing/UserListing';

export type ShareKind = 'none' | 'public';

interface Props {
    onClose?: () => void;
    onChange?: (kind: ShareKind) => void;
}

export default function SharePanel({ onClose, onChange }: Props) {
    const { t } = useTranslation();
    const doClick = useCallback(() => {
        if (onChange) onChange('public');
        if (onClose) onClose();
    }, [onChange, onClose]);

    return (
        <ActionPanel
            horizontal="hfull"
            vertical="vfull"
            onClose={onClose}
        >
            <div
                className={style.sharecontainer}
                data-testid="feed-image-share-panel"
            >
                <div className={style.shareLabel}>{t('feed.titles.shareWith')}</div>
                <UserListing onSelect={doClick} />
            </div>
        </ActionPanel>
    );
}
