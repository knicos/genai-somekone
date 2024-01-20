import style from './style.module.css';
import TextField from '@mui/material/TextField';
import ActionPanel from './ActionPanel';
import { useTranslation } from 'react-i18next';
import { useCallback, useState } from 'react';
import { ContentNodeId } from '@genaism/services/graph/graphTypes';
import { getComments } from '@genaism/services/content/content';
import Comment from './Comment';
import { Button } from '../Button/Button';

interface Props {
    id: ContentNodeId;
    onClose?: () => void;
    onComment?: (l: string) => void;
}

export default function CommentPanel({ onClose, onComment, id }: Props) {
    const { t } = useTranslation();
    const [showMore, setShowMore] = useState(false);

    const doKeyCheck = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                if (onComment) {
                    onComment((e.target as HTMLInputElement).value);
                }

                if (onClose) onClose();
            }
        },
        [onComment, onClose]
    );

    const comments = getComments(id);

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
                <TextField
                    variant="outlined"
                    placeholder={t('feed.placeholders.comment')}
                    inputProps={{ 'data-testid': 'comment-input' }}
                    onKeyDown={doKeyCheck}
                />
                <ul className={style.commentList}>
                    {comments.length === 0 && <li>{t('feed.messages.noComments')}</li>}
                    {comments.length > 0 && (
                        <>
                            {!showMore && (
                                <Comment
                                    comment={comments[comments.length - 1].comment}
                                    user={comments[comments.length - 1].userId}
                                />
                            )}
                            {showMore &&
                                comments.map((c, ix) => (
                                    <Comment
                                        key={ix}
                                        comment={c.comment}
                                        user={c.userId}
                                    />
                                ))}
                            {comments.length > 1 && !showMore && (
                                <li>
                                    <Button
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
