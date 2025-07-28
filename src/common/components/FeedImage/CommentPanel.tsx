import style from './style.module.css';
import ActionPanel from './ActionPanel';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import Comment from './Comment';
import { Button } from '@genai-fi/base';
import { ContentNodeId } from '@genai-fi/recom';
import CommentBox from './CommentBox';
import { useContentComments } from '@genaism/hooks/content';

interface Props {
    id: ContentNodeId;
    onClose?: () => void;
    onComment?: (l: string) => void;
    disabled?: boolean;
}

export default function CommentPanel({ onClose, onComment, id, disabled }: Props) {
    const { t } = useTranslation();
    const [showMore, setShowMore] = useState(false);
    const comments = useContentComments(id) || [];

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
                    <CommentBox
                        id={id}
                        onClose={onClose}
                        onComment={onComment}
                    />
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
