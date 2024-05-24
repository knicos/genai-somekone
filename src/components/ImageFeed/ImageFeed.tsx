import React, { useRef, useCallback, useState, useEffect, FocusEvent } from 'react';
import IImage from '../FeedImage/FeedImage';
import style from './style.module.css';
import { LogActivity, LogEntry } from '@genaism/services/profiler/profilerTypes';
import { LikeKind } from '@genaism/components/FeedImage/FeedImage';
import { ShareKind } from '@genaism/components/FeedImage/SharePanel';
import FeedSpacer from './FeedSpacer';
import { useTabActive } from '@genaism/hooks/interaction';
import { useTranslation } from 'react-i18next';
import { ContentNodeId } from '@genaism/services/graph/graphTypes';
import { ScoredRecommendation } from '@genaism/services/recommender/recommenderTypes';
import { updateEngagement } from '@genaism/services/profiler/profiler';
import Spinner from '../Spinner/Spinner';
import LangSelect from '../LangSelect/LangSelect';

const INTERACTION_TIMEOUT = 5000;

interface Props {
    images: ScoredRecommendation[];
    noActions?: boolean;
    showLabels?: boolean;
    onView?: (index: number, time: number) => void;
    onMore?: () => void;
    onLog: (e: LogEntry) => void;
    alwaysActive?: boolean;
}

export default function ImageFeed({ images, onView, onMore, onLog, noActions, showLabels, alwaysActive }: Props) {
    const { t } = useTranslation();
    const containerRef = useRef<HTMLDivElement>(null);
    const [viewed, setViewed] = useState(0);
    const prevRef = useRef<number>(-1);
    const startRef = useRef<number>(0);
    const lastRef = useRef<number>(0);
    const viewedRef = useRef<ScoredRecommendation>();
    const canMoreRef = useRef(true);
    const durationRef = useRef<number>(0);
    const active = useTabActive();
    const [focus, setFocus] = useState(false);
    //const ref = useRef<HTMLDivElement>(null);

    viewedRef.current = images[viewed];

    const activeState = alwaysActive || (focus && active);

    useEffect(() => {
        const now = Date.now();
        if (active) {
            durationRef.current = now;
            startRef.current = now;
            onLog({ activity: 'begin', timestamp: now });
            if (containerRef.current) {
                containerRef.current.focus();
            }
        } else if (viewedRef.current) {
            onLog({
                activity: 'end',
                timestamp: now,
                value: now - durationRef.current,
                id: viewedRef.current.contentId,
            });
        }
    }, [active, onLog]);

    useEffect(() => {
        canMoreRef.current = true;
    }, [images]);

    const doSeen = useCallback(
        (index: number) => {
            const img = images[index];
            if (img) {
                onLog({ activity: 'seen', id: img.contentId, timestamp: Date.now() });
            }
        },
        [images, onLog]
    );

    const doDwell = useCallback(
        (v: number, index: number) => {
            onLog({ activity: 'dwell', value: v, id: images[index].contentId, timestamp: Date.now() });
        },
        [images, onLog]
    );

    useEffect(() => {
        const now = Date.now();
        if (viewed === prevRef.current) return;
        if (prevRef.current >= 0) {
            const delta = now - startRef.current;
            doDwell(delta, prevRef.current);
            updateEngagement(images[prevRef.current]);
        }
        doSeen(viewed);
        startRef.current = now;
        prevRef.current = viewed;
    }, [viewed, onView, onLog, images, doDwell, doSeen]);

    const doInteraction = useCallback(() => {
        const now = Date.now();
        if (now - lastRef.current > INTERACTION_TIMEOUT) {
            startRef.current = now;
        }
        lastRef.current = now;

        if (containerRef.current && !focus) {
            containerRef.current.focus();
        }
    }, [focus]);

    const doScroll = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            const scrollHeight = e.currentTarget.scrollHeight;
            const imageHeight = Math.floor((scrollHeight - 50 - 80) / images.length);
            const scrollTop = e.currentTarget.scrollTop + imageHeight / 2 - 50 - 80;
            const imgIndex = Math.floor(scrollTop / imageHeight + 0.2);

            const now = Date.now();
            if (now - lastRef.current > INTERACTION_TIMEOUT) {
                onLog({
                    activity: 'inactive',
                    value: now - lastRef.current,
                    id: images[imgIndex].contentId,
                    timestamp: Date.now(),
                });
                startRef.current = now;
            }
            lastRef.current = now;

            setViewed(imgIndex);
            if (onMore && imgIndex >= images.length - 4) {
                if (canMoreRef.current) {
                    onMore();
                }
                canMoreRef.current = false;
            }

            if (containerRef.current && !focus) {
                containerRef.current.focus();
            }
        },
        [images, setViewed, onMore, focus, onLog]
    );

    const doLike = useCallback(
        (id: ContentNodeId, kind: LikeKind) => {
            if (kind !== 'none') {
                onLog({ activity: kind, id, timestamp: Date.now() });
            } else {
                onLog({ activity: 'unreact', id, timestamp: Date.now() });
            }
        },
        [onLog]
    );

    const doShare = useCallback(
        (id: ContentNodeId, kind: ShareKind) => {
            let type: LogActivity = 'share_private';
            switch (kind) {
                case 'friends':
                    type = 'share_friends';
                    break;
                case 'individual':
                    type = 'share_private';
                    break;
                case 'public':
                    type = 'share_public';
                    break;
            }
            if (kind !== 'none') {
                onLog({ activity: type, id, timestamp: Date.now() });
            }
        },
        [onLog]
    );

    const doFollow = useCallback(
        (id: ContentNodeId) => {
            onLog({ activity: 'follow', id, timestamp: Date.now() });
        },
        [onLog]
    );

    const doUnfollow = useCallback(
        (id: ContentNodeId) => {
            onLog({ activity: 'unfollow', id, timestamp: Date.now() });
        },
        [onLog]
    );

    const doComment = useCallback(
        (id: ContentNodeId, l: string) => {
            onLog({ activity: 'comment', id, timestamp: Date.now(), value: l.length, content: l });
        },
        [onLog]
    );

    return (
        <div className={style.outer}>
            <div
                ref={containerRef}
                className={style.container}
                onScroll={doScroll}
                onMouseMove={doInteraction}
                onKeyDown={doInteraction}
                onTouchStart={doInteraction}
                onMouseDown={doInteraction}
                tabIndex={0}
                onFocus={() => setFocus(true)}
                onBlur={(e: FocusEvent) => {
                    const ischild = e.currentTarget.contains(e.relatedTarget);
                    if (!ischild) setFocus(false);
                }}
            >
                <div
                    className={style.titleOuter}
                    style={{ minHeight: noActions ? '40px' : undefined }}
                >
                    {!noActions && (
                        <header className={style.title}>
                            <img
                                src="/logo48_bw.png"
                                alt="GenAIMedia Logo"
                                width={48}
                                height={48}
                            />
                            <h1>{t('feed.titles.main')}</h1>
                            <div className={style.language}>
                                <LangSelect />
                            </div>
                        </header>
                    )}
                </div>

                <div className={style.topSpacer} />
                <FeedSpacer size={viewed - 4} />
                {images.length === 0 && <Spinner />}
                {images.map((img, ix) => (
                    <IImage
                        key={ix}
                        id={img.contentId}
                        onLike={doLike}
                        onFollow={doFollow}
                        onUnfollow={doUnfollow}
                        onShare={doShare}
                        onComment={doComment}
                        active={activeState && (ix === viewed || (ix === 0 && viewed === -1))}
                        visible={Math.abs(ix - viewed) < 5}
                        noActions={noActions}
                        showLabels={showLabels}
                    />
                ))}
                <FeedSpacer size={images.length - viewed - 5} />
            </div>
        </div>
    );
}
