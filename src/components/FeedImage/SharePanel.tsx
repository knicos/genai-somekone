import React, { useCallback } from 'react';
import style from './style.module.css';
import { Button } from '@mui/material';
import ActionPanel from './ActionPanel';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import PublicIcon from '@mui/icons-material/Public';
import { useTranslation } from 'react-i18next';

export type ShareKind = 'none' | 'individual' | 'friends' | 'public';

interface Props {
    onClose?: () => void;
    onChange?: (kind: ShareKind) => void;
}

export default function SharePanel({ onClose, onChange }: Props) {
    const { t } = useTranslation();
    const doClick = useCallback(
        (e: React.MouseEvent) => {
            const name = e.currentTarget.getAttribute('data-type');
            if (onChange) onChange(name as ShareKind);
            if (onClose) onClose();
        },
        [onChange, onClose]
    );

    return (
        <ActionPanel
            horizontal="right"
            vertical="bottom"
            onClose={onClose}
        >
            <div
                className={style.sharecontainer}
                data-testid="feed-image-share-panel"
            >
                <div className={style.shareLabel}>{t('feed.titles.shareWith')}</div>
                <Button
                    date-type="individual"
                    onClick={doClick}
                    startIcon={<PersonIcon />}
                >
                    {t('feed.actions.share.private')}
                </Button>
                <Button
                    data-type="friends"
                    onClick={doClick}
                    startIcon={<PeopleIcon />}
                    data-testid="share-friends-button"
                >
                    {t('feed.actions.share.friends')}
                </Button>
                <Button
                    data-type="public"
                    onClick={doClick}
                    startIcon={<PublicIcon />}
                >
                    {t('feed.actions.share.everyone')}
                </Button>
            </div>
        </ActionPanel>
    );
}
