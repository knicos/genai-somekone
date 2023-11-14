import style from './style.module.css';
import TextField from '@mui/material/TextField';
import ActionPanel from './ActionPanel';
import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';

interface Props {
    onClose?: () => void;
    onComment?: (l: number) => void;
}

export default function CommentPanel({ onClose, onComment }: Props) {
    const { t } = useTranslation();

    const doKeyCheck = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                if (onComment) {
                    onComment((e.target as HTMLInputElement).value.length);
                }

                if (onClose) onClose();
            }
        },
        [onComment, onClose]
    );

    return (
        <ActionPanel
            horizontal="hfull"
            vertical="bottom"
            onClose={onClose}
        >
            <div
                className={style.commentbubble}
                data-testid="feed-image-comment-panel"
            >
                <TextField
                    variant="outlined"
                    placeholder={t('feed.placeholders.comment')}
                    inputProps={{ 'data-testid': 'comment-input' }}
                    onKeyDown={doKeyCheck}
                />
                <div className={style.commentList}>{t('feed.messages.noComments')}</div>
            </div>
        </ActionPanel>
    );
}
