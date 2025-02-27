import { Button } from '@knicos/genai-base';
import { ContentNodeId } from '@knicos/genai-recom';
import { TextField } from '@mui/material';
import { ChangeEvent, useCallback, useState } from 'react';
import style from './style.module.css';
import { useTranslation } from 'react-i18next';

const MAX_COMMENT_LENGTH = 400;

const unsavedComments = new Map<ContentNodeId, string>();

interface Props {
    id: ContentNodeId;
    onClose?: () => void;
    onComment?: (l: string) => void;
}

export default function CommentBox({ id, onComment, onClose }: Props) {
    const { t } = useTranslation();
    const [value, setValue] = useState<string>(unsavedComments.get(id) || '');

    const doChange = useCallback(
        (e: ChangeEvent<HTMLTextAreaElement>) => {
            const v = e.target.value;
            if (v.length <= MAX_COMMENT_LENGTH) {
                setValue(v);
                unsavedComments.set(id, v);
            }
        },
        [id]
    );

    return (
        <div className={style.commentInputRow}>
            <TextField
                error={value.length === MAX_COMMENT_LENGTH}
                value={value}
                onChange={doChange}
                fullWidth
                variant="outlined"
                placeholder={t('feed.placeholders.comment')}
                slotProps={{ htmlInput: { 'data-testid': 'comment-input', autoFocus: true } }}
                multiline
                maxRows={2}
            />
            <Button
                data-testid="comment-post-button"
                variant="contained"
                disabled={value.length === 0}
                onClick={() => {
                    if (onComment) {
                        onComment(value);
                        unsavedComments.delete(id);
                    }
                    if (onClose) onClose();
                    else {
                        setValue('');
                    }
                }}
            >
                {t('feed.actions.post')}
            </Button>
        </div>
    );
}
