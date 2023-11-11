import React, { useCallback } from 'react';
import style from './style.module.css';
import { Button } from '@mui/material';
import ActionPanel from './ActionPanel';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import PublicIcon from '@mui/icons-material/Public';

export type ShareKind = 'none' | 'individual' | 'friends' | 'public';

interface Props {
    onClose?: () => void;
    onChange?: (kind: ShareKind) => void;
}

export default function SharePanel({ onClose, onChange }: Props) {
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
            <div className={style.sharecontainer}>
                <div className={style.shareLabel}>Share with</div>
                <Button
                    date-type="individual"
                    onClick={doClick}
                    startIcon={<PersonIcon />}
                >
                    Private
                </Button>
                <Button
                    data-type="friends"
                    onClick={doClick}
                    startIcon={<PeopleIcon />}
                >
                    Friends Only
                </Button>
                <Button
                    data-type="public"
                    onClick={doClick}
                    startIcon={<PublicIcon />}
                >
                    Everyone
                </Button>
            </div>
        </ActionPanel>
    );
}
