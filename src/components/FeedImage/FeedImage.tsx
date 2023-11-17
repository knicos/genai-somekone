import { useCallback, useState } from 'react';
import style from './style.module.css';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import { styled } from '@mui/material';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import LikePanel, { LikeKind } from './LikePanel';
import ReplyIcon from '@mui/icons-material/Reply';
import Avatar from '@mui/material/Avatar';
import SharePanel, { ShareKind } from './SharePanel';
import CommentPanel from './CommentPanel';
import { getContentData, getContentMetadata } from '@genaism/services/content/content';
import { useTranslation } from 'react-i18next';

type ActionPanel = 'none' | 'like' | 'comment' | 'share' | 'discard' | 'author';

interface Props {
    id: string;
    active?: boolean;
    visible?: boolean;
    onClick?: (id: string) => void;
    onLike?: (id: string, kind: LikeKind) => void;
    onShare?: (id: string, kind: ShareKind) => void;
    onComment?: (id: string, length: number) => void;
    onFollow?: (id: string) => void;
}

const SButton = styled(Button)({
    textTransform: 'none',
    alignSelf: 'right',
});

const LIKEMAP = {
    like: '👍',
    laugh: '😂',
    love: '😍',
    sad: '😢',
    anger: '😡',
    wow: '😯',
};

function stringToColor(string: string) {
    let hash = 0;
    let i;

    for (i = 0; i < string.length; i += 1) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '#';

    for (i = 0; i < 3; i += 1) {
        const value = (hash >> (i * 8)) & 0xff;
        color += `00${value.toString(16)}`.slice(-2);
    }

    return color;
}

function stringAvatar(name: string) {
    const split = name.split(' ');
    return {
        sx: {
            bgcolor: stringToColor(name),
        },
        children: `${split[0][0].toLocaleUpperCase()}${split.length > 1 ? split[1][0].toLocaleUpperCase() : ''}`,
    };
}

export default function FeedImage({ id, onClick, onLike, onFollow, onShare, onComment, active, visible }: Props) {
    const { t } = useTranslation();
    const contentData = getContentData(id); //useRecoilValue(contentCache(id));
    const contentMeta = getContentMetadata(id);
    const [liked, setLiked] = useState<LikeKind>('none');
    const [activePanel, setActivePanel] = useState<ActionPanel>('none');
    const [followed, setFollowed] = useState(false);
    const doClick = useCallback(() => {
        if (onClick) onClick(id);
    }, [onClick, id]);

    const doLike = useCallback(
        (kind: LikeKind) => {
            setLiked(kind);
            if (onLike) onLike(id, kind);
        },
        [onLike, id]
    );

    const doShare = useCallback(
        (kind: ShareKind) => {
            if (onShare) onShare(id, kind);
        },
        [onShare, id]
    );

    const doComment = useCallback(
        (l: number) => {
            if (onComment) {
                onComment(id, l);
            }
        },
        [onComment]
    );

    const doShowPanel = useCallback(() => {
        setActivePanel('like');
    }, [setActivePanel]);

    const doShowSharePanel = useCallback(() => {
        setActivePanel('share');
    }, [setActivePanel]);

    const doShowComments = useCallback(() => {
        setActivePanel('comment');
    }, [setActivePanel]);

    const doFollow = useCallback(() => {
        setFollowed((v) => !v);
        if (onFollow) onFollow(id);
    }, [onFollow, id]);

    const doCloseLike = useCallback(() => {
        setActivePanel('none');
    }, []);

    /*useEffect(() => {
        if (!content && reqContent) {
            reqContent.fn({ event: 'eter:request_content', id });
        }
    }, [content, reqContent, id]);*/

    return !visible || !contentData || !contentMeta ? null : (
        <div className={style.container}>
            <div className={active ? style.activeImageContainer : style.imageContainer}>
                <div className={style.name}>
                    <Avatar {...stringAvatar(contentMeta.author || 'Unknown')} />
                    <span className={style.author}>{contentMeta.author || 'Unknown'}</span>
                    <SButton
                        variant={followed ? 'outlined' : 'contained'}
                        size="small"
                        onClick={doFollow}
                        data-testid="feed-image-follow-button"
                    >
                        {followed ? t('feed.actions.unfollow') : t('feed.actions.follow')}
                    </SButton>
                </div>
                <img
                    onClick={doClick}
                    className={style.instaImage}
                    src={contentData}
                    alt="Insta Upload"
                    data-testid="feed-image-element"
                />
                <div className={style.buttonRow}>
                    <IconButton
                        className={liked !== 'none' ? style.liked : ''}
                        onClick={doShowPanel}
                        color="inherit"
                        data-testid="feed-image-like-button"
                    >
                        {liked !== 'none' ? (
                            <div className={style.iconContainer}>{LIKEMAP[liked]}</div>
                        ) : (
                            <ThumbUpOffAltIcon
                                color="inherit"
                                fontSize="large"
                            />
                        )}
                    </IconButton>
                    <IconButton
                        color="inherit"
                        onClick={doShowComments}
                        data-testid="feed-image-comment-button"
                    >
                        <ChatBubbleOutlineIcon
                            color="inherit"
                            fontSize="large"
                        />
                    </IconButton>
                    <IconButton
                        color="inherit"
                        onClick={doShowSharePanel}
                        data-testid="feed-image-share-button"
                    >
                        <ReplyIcon
                            color="inherit"
                            fontSize="large"
                            style={{ transform: 'scaleX(-1)' }}
                        />
                    </IconButton>
                </div>
                {activePanel === 'like' && (
                    <LikePanel
                        onClose={doCloseLike}
                        onChange={doLike}
                    />
                )}
                {activePanel === 'share' && (
                    <SharePanel
                        onClose={doCloseLike}
                        onChange={doShare}
                    />
                )}
                {activePanel === 'comment' && (
                    <CommentPanel
                        onClose={doCloseLike}
                        onComment={doComment}
                    />
                )}
            </div>
        </div>
    );
}
