import React, { useCallback } from 'react';
import style from './style.module.css';
import IconButton from '@mui/material/IconButton';
import ActionPanel from './ActionPanel';

export type LikeKind = 'none' | 'like' | 'love' | 'laugh' | 'wow' | 'anger' | 'sad';

interface Props {
    onClose?: () => void;
    onChange?: (kind: LikeKind) => void;
}

export default function LikePanel({ onClose, onChange }: Props) {
    const doClick = useCallback(
        (e: React.MouseEvent) => {
            const name = e.currentTarget.getAttribute('data-type');
            if (onChange) onChange(name as LikeKind);
            if (onClose) onClose();
        },
        [onChange, onClose]
    );

    return (
        <ActionPanel
            horizontal="left"
            vertical="bottom"
            onClose={onClose}
        >
            <div
                className={style.bubble}
                data-testid="feed-image-like-panel"
            >
                <IconButton
                    color="inherit"
                    data-type="like"
                    onClick={doClick}
                    data-testid="like-button"
                >
                    <span className={style.likeIcon}>👍</span>
                </IconButton>
                <IconButton
                    color="inherit"
                    data-type="love"
                    onClick={doClick}
                >
                    <span className={style.likeIcon}>😍</span>
                </IconButton>
                <IconButton
                    color="inherit"
                    data-type="laugh"
                    onClick={doClick}
                >
                    <span className={style.likeIcon}>😂</span>
                </IconButton>
                <IconButton
                    color="inherit"
                    data-type="wow"
                    onClick={doClick}
                    data-testid="wow-button"
                >
                    <span className={style.likeIcon}>😯</span>
                </IconButton>
                <IconButton
                    color="inherit"
                    data-type="sad"
                    onClick={doClick}
                >
                    <span className={style.likeIcon}>😢</span>
                </IconButton>
                <IconButton
                    color="inherit"
                    data-type="anger"
                    onClick={doClick}
                >
                    <span className={style.likeIcon}>😡</span>
                </IconButton>
            </div>
        </ActionPanel>
    );
}
