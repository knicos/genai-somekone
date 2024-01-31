import { useCallback, useEffect, useState } from 'react';
import style from './style.module.css';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import IconButton from '@mui/material/IconButton';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import LikePanel, { LikeKind } from './LikePanel';
import ReplyIcon from '@mui/icons-material/Reply';
import Avatar from '@mui/material/Avatar';
import SharePanel, { ShareKind } from './SharePanel';
import CommentPanel from './CommentPanel';
import { getComments, getContentData, getContentMetadata } from '@genaism/services/content/content';
import { ContentNodeId } from '@genaism/services/graph/graphTypes';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import LabelsPanel from './LabelsPanel';
import IconButtonDot from '../IconButtonDot/IconButtonDot';

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
}

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

export default function FeedImage({
    id,
    onClick,
    onLike,
    onFollow,
    onShare,
    onComment,
    active,
    visible,
    noActions,
    showLabels,
}: Props) {
    const contentData = getContentData(id); //useRecoilValue(contentCache(id));
    const contentMeta = getContentMetadata(id);
    const [liked, setLiked] = useState<LikeKind>('none');
    const [activePanel, setActivePanel] = useState<ActionPanel>('none');
    const [followed, setFollowed] = useState(false);
    const doClick = useCallback(() => {
        if (onClick) onClick(id);
        setActivePanel('none');
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
        (l: string) => {
            if (onComment) {
                onComment(id, l);
            }
        },
        [onComment, id]
    );

    const doShowPanel = useCallback(() => {
        setActivePanel('like');
    }, [setActivePanel]);

    const doShowSharePanel = useCallback(() => {
        setActivePanel('share');
    }, [setActivePanel]);

    const doShowComments = useCallback(() => {
        setActivePanel((current) => (current === 'comment' ? 'none' : 'comment'));
    }, [setActivePanel]);

    const doFollow = useCallback(() => {
        setFollowed((v) => {
            if (onFollow && !v) onFollow(id);
            return !v;
        });
    }, [onFollow, id]);

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
                        <IconButtonDot
                            count={getComments(id).length}
                            color="inherit"
                            onClick={doShowComments}
                            data-testid="feed-image-comment-button"
                        >
                            <ChatBubbleOutlineIcon
                                color="inherit"
                                fontSize="large"
                            />
                        </IconButtonDot>
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
                )}
                {active && showLabels && activePanel === 'none' && (
                    <LabelsPanel labels={contentMeta.labels.filter((l) => l.weight > 0).map((l) => l.label)} />
                )}
                {active && activePanel === 'like' && (
                    <LikePanel
                        onClose={doCloseLike}
                        onChange={doLike}
                    />
                )}
                {active && activePanel === 'share' && (
                    <SharePanel
                        onClose={doCloseLike}
                        onChange={doShare}
                    />
                )}
                {active && activePanel === 'comment' && (
                    <CommentPanel
                        id={id}
                        onClose={doCloseLike}
                        onComment={doComment}
                    />
                )}
            </div>
        </div>
    );
}
