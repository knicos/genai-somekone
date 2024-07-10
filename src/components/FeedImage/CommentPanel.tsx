import style from './style.module.css';
import TextField from '@mui/material/TextField';
import ActionPanel from './ActionPanel';
import { useTranslation } from 'react-i18next';
import { ChangeEvent, useCallback, useState } from 'react';
import { ContentNodeId } from '@genaism/services/graph/graphTypes';
import { getComments } from '@genaism/services/content/content';
import Comment from './Comment';
import { Button } from '@knicos/genai-base';

const MAX_COMMENT_LENGTH = 400;

interface Props {
    id: ContentNodeId;
    onClose?: () => void;
    onComment?: (l: string) => void;
    disabled?: boolean;
}

const unsavedComments = new Map<ContentNodeId, string>();

export default function CommentPanel({ onClose, onComment, id, disabled }: Props) {
    const { t } = useTranslation();
    const [value, setValue] = useState<string>(unsavedComments.get(id) || '');
    const [showMore, setShowMore] = useState(false);

    const comments = getComments(id);

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
        <ActionPanel
            horizontal="hfull"
            vertical="bottom"
            onClose={onClose}
            noTimeout
        >
            <div
                className={style.commentbubble}
                data-testid="feed-image-comment-panel"
            >
                {!disabled && (
                    <div className={style.commentInputRow}>
                        <TextField
                            error={value.length === MAX_COMMENT_LENGTH}
                            value={value}
                            onChange={doChange}
                            fullWidth
                            variant="outlined"
                            placeholder={t('feed.placeholders.comment')}
                            inputProps={{ 'data-testid': 'comment-input' }}
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
                            }}
                        >
                            {t('feed.actions.post')}
                        </Button>
                    </div>
                )}
                <ul className={style.commentList}>
                    {comments.length === 0 && <li>{t('feed.messages.noComments')}</li>}
                    {comments.length > 0 && (
                        <>
                            {!showMore && (
                                <Comment
                                    comment={comments[0].comment}
                                    user={comments[0].userId}
                                />
                            )}
                            {showMore &&
                                comments.map((c, ix) => (
                                    <Comment
                                        key={ix}
                                        comment={c.comment}
                                        user={c.userId}
                                        noLimit
                                    />
                                ))}
                            {comments.length > 1 && !showMore && (
                                <li>
                                    <Button
                                        data-testid="moreComments-button"
                                        size="small"
                                        style={{ marginLeft: '0.5rem' }}
                                        onClick={() => setShowMore(true)}
                                    >
                                        {t('feed.actions.moreComments')}
                                    </Button>
                                </li>
                            )}
                        </>
                    )}
                </ul>
            </div>
        </ActionPanel>
    );
}
