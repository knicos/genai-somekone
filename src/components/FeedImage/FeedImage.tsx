import { useCallback, useEffect, useReducer, useState } from 'react';
import style from './style.module.css';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import IconButton from '@mui/material/IconButton';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ReplyIcon from '@mui/icons-material/Reply';
import Avatar from '@mui/material/Avatar';
import SharePanel, { ShareKind } from './SharePanel';
import CommentPanel from './CommentPanel';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import LabelsPanel from './LabelsPanel';
import IconButtonDot from '../IconButtonDot/IconButtonDot';
import { useTranslation } from 'react-i18next';
import { ContentNodeId } from '@knicos/genai-recom';
import { useContentService } from '@genaism/hooks/services';

const MAX_COMMENTS = 10;

type ActionPanel = 'none' | 'like' | 'comment' | 'share' | 'discard' | 'author';

interface Props {
    id: ContentNodeId;
    active?: boolean;
    visible?: boolean;
    noActions?: boolean;
    showLabels?: boolean;
    onClick?: (id: ContentNodeId) => void;
    onLike?: (id: ContentNodeId, kind: LikeKind) => void;
    onShare?: (id: ContentNodeId, kind: ShareKind) => void;
    onComment?: (id: ContentNodeId, comment: string) => void;
    onFollow?: (id: ContentNodeId) => void;
    onUnfollow?: (id: ContentNodeId) => void;
}

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

export type LikeKind = 'none' | 'like';

export default function FeedImage({
    id,
    onClick,
    onLike,
    onFollow,
    onUnfollow,
    onShare,
    onComment,
    active,
    visible,
    noActions,
    showLabels,
}: Props) {
    const { t } = useTranslation();
    const content = useContentService();
    const contentData = content.getContentData(id); //useRecoilValue(contentCache(id));
    const contentMeta = content.getContentMetadata(id);
    const [liked, setLiked] = useState<LikeKind>('none');
    const [activePanel, setActivePanel] = useState<ActionPanel>('none');
    const [followed, setFollowed] = useState(false);
    const [shareState, setShareState] = useState(new Set<ShareKind>());
    const [commentCount, incComment] = useReducer((v) => ++v, 0);
    const doClick = useCallback(() => {
        if (onClick) onClick(id);
        setActivePanel('none');
    }, [onClick, id]);

    const doLike = useCallback(() => {
        setLiked((old) => {
            const kind = old === 'none' ? 'like' : 'none';
            if (onLike) onLike(id, kind);
            return kind;
        });
    }, [onLike, id]);

    const doShare = useCallback(
        (kind: ShareKind) => {
            setShareState((old) => {
                const n = new Set(old);
                n.add(kind);
                return n;
            });
            if (onShare) onShare(id, kind);
        },
        [onShare, id]
    );

    const doComment = useCallback(
        (l: string) => {
            if (onComment) {
                onComment(id, l);
                incComment();
            }
        },
        [onComment, id]
    );

    const doShowSharePanel = useCallback(() => {
        setActivePanel('share');
    }, [setActivePanel]);

    const doShowComments = useCallback(() => {
        setActivePanel((current) => (current === 'comment' ? 'none' : 'comment'));
    }, [setActivePanel]);

    const doFollow = useCallback(() => {
        setFollowed((v) => {
            if (onFollow && !v) onFollow(id);
            if (onUnfollow && v) onUnfollow(id);
            return !v;
        });
    }, [onFollow, id, onUnfollow]);

    const doCloseLike = useCallback(() => {
        setActivePanel('none');
    }, []);

    useEffect(() => {
        if (!active) setActivePanel('none');
    }, [active]);

    /*useEffect(() => {
        if (!content && reqContent) {
            reqContent.fn({ event: 'eter:request_content', id });
        }
    }, [content, reqContent, id]);*/

    const stats = content.getContentStats(id);

    return !visible || !contentData || !contentMeta ? null : (
        <div className={style.container}>
            <div className={active || noActions ? style.activeImageContainer : style.imageContainer}>
                {(active || noActions) && (
                    <div className={style.name}>
                        <Avatar {...stringAvatar(contentMeta.author || 'Unknown')} />
                        <span className={style.author}>{contentMeta.author || 'Unknown'}</span>
                        {!noActions && (
                            <IconButton
                                color="inherit"
                                onClick={doFollow}
                                data-testid="feed-image-follow-button"
                                aria-label={t('feed.aria.followUser')}
                                aria-pressed={followed}
                            >
                                {followed ? (
                                    <PersonRemoveIcon
                                        color="inherit"
                                        fontSize="large"
                                    />
                                ) : (
                                    <PersonAddIcon
                                        color="inherit"
                                        fontSize="large"
                                    />
                                )}
                            </IconButton>
                        )}
                    </div>
                )}
                <img
                    onClick={doClick}
                    className={style.instaImage}
                    src={contentData}
                    alt="Insta Upload"
                    data-testid="feed-image-element"
                />
                {active && !noActions && (
                    <div className={style.buttonRow}>
                        <IconButtonDot
                            count={stats.reactions}
                            className={liked !== 'none' ? style.liked : ''}
                            onClick={() => doLike()}
                            color="inherit"
                            data-testid="feed-image-like-button"
                            aria-label={t('feed.aria.showLikeOptions')}
                        >
                            {liked !== 'none' ? (
                                <FavoriteIcon
                                    color="inherit"
                                    fontSize="large"
                                />
                            ) : (
                                <FavoriteBorderIcon
                                    color="inherit"
                                    fontSize="large"
                                />
                            )}
                        </IconButtonDot>
                        <IconButtonDot
                            count={content.getComments(id).length}
                            color="inherit"
                            onClick={doShowComments}
                            data-testid="feed-image-comment-button"
                            aria-label={t('feed.aria.showComments')}
                        >
                            <ChatBubbleOutlineIcon
                                color="inherit"
                                fontSize="large"
                            />
                        </IconButtonDot>
                        <IconButtonDot
                            count={stats.shares}
                            position="left"
                            color="inherit"
                            onClick={doShowSharePanel}
                            data-testid="feed-image-share-button"
                            aria-label={t('feed.aria.showShareOptions')}
                        >
                            <ReplyIcon
                                color="inherit"
                                fontSize="large"
                                style={{ transform: 'scaleX(-1)' }}
                            />
                        </IconButtonDot>
                    </div>
                )}
                {active && showLabels && activePanel === 'none' && (
                    <LabelsPanel labels={contentMeta.labels.filter((l) => l.weight > 0).map((l) => l.label)} />
                )}
                {active && activePanel === 'share' && (
                    <SharePanel
                        onClose={doCloseLike}
                        onChange={doShare}
                        state={shareState}
                    />
                )}
                {active && activePanel === 'comment' && (
                    <CommentPanel
                        id={id}
                        onClose={doCloseLike}
                        onComment={doComment}
                        disabled={commentCount >= MAX_COMMENTS}
                    />
                )}
            </div>
        </div>
    );
}
