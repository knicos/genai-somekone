import React, { useRef, useCallback, useState, useEffect } from 'react';
import IImage from '../FeedImage/FeedImage';
import style from './style.module.css';
import CircularProgress from '@mui/material/CircularProgress';
import { LogActivity, LogEntry } from '@genaism/services/profiler/profilerTypes';
import { LikeKind } from '@genaism/components/FeedImage/LikePanel';
import { ShareKind } from '@genaism/components/FeedImage/SharePanel';
import FeedSpacer from './FeedSpacer';
import { useTabActive } from '@genaism/hooks/interaction';

const MIN_DWELL_TIME = 2000;
const MAX_DWELL_TIME = 10000;
const INTERACTION_TIMEOUT = 5000;

interface Props {
    images: string[];
    onView?: (index: number, time: number) => void;
    onMore?: () => void;
    onLog: (e: LogEntry) => void;
}

export default function ImageFeed({ images, onView, onMore, onLog }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [viewed, setViewed] = useState(0);
    const prevRef = useRef<number>(-1);
    const startRef = useRef<number>(0);
    const lastRef = useRef<number>(0);
    const canMoreRef = useRef(true);
    const durationRef = useRef<number>(0);
    const active = useTabActive();

    useEffect(() => {
        const now = Date.now();
        if (active) {
            durationRef.current = now;
            startRef.current = now;
            onLog({ activity: 'begin', timestamp: now });
        } else {
            onLog({ activity: 'end', timestamp: now, value: now - durationRef.current });
        }
    }, [active]);

    useEffect(() => {
        canMoreRef.current = true;
    }, [images]);

    useEffect(() => {
        const now = Date.now();
        if (viewed === prevRef.current) return;
        onLog({ activity: 'seen', id: images[viewed], timestamp: Date.now() });
        if (prevRef.current >= 0) {
            const delta = now - startRef.current;
            //if (delta > 1000) {
            const norm = Math.max(0, Math.min(10, (delta - MIN_DWELL_TIME) / (MAX_DWELL_TIME - MIN_DWELL_TIME)));
            // onView(prevRef.current, norm);
            onLog({ activity: 'dwell', value: norm, id: images[viewed], timestamp: Date.now() });
            //}
        }
        startRef.current = now;
        prevRef.current = viewed;
    }, [viewed, onView, onLog, images]);

    const doInteraction = useCallback(() => {
        const now = Date.now();
        if (now - lastRef.current > INTERACTION_TIMEOUT) {
            startRef.current = now;
        }
        lastRef.current = now;
    }, []);

    const doScroll = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            const scrollTop = e.currentTarget.scrollTop + 50;
            const scrollHeight = e.currentTarget.scrollHeight;
            const clientHeight = e.currentTarget.clientHeight;

            const now = Date.now();
            if (now - lastRef.current > INTERACTION_TIMEOUT) {
                startRef.current = now;
            }
            lastRef.current = now;

            const imgIndex = Math.round((scrollTop / (scrollHeight - clientHeight)) * (images.length - 1));
            setViewed(imgIndex);
            if (onMore && imgIndex >= images.length - 4) {
                if (canMoreRef.current) {
                    onMore();
                }
                canMoreRef.current = false;
            }
        },
        [images, setViewed, onMore]
    );

    const doLike = useCallback(
        (id: string, kind: LikeKind) => {
            if (kind !== 'none') {
                onLog({ activity: kind, id, timestamp: Date.now() });
            }
        },
        [onLog]
    );

    const doShare = useCallback(
        (id: string, kind: ShareKind) => {
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
        (id: string) => {
            onLog({ activity: 'follow', id, timestamp: Date.now() });
        },
        [onLog]
    );

    const doComment = useCallback(
        (id: string, l: number) => {
            onLog({ activity: 'comment', id, timestamp: Date.now(), value: l });
        },
        [onLog]
    );

    return (
        <div
            className={style.outer}
            onMouseMove={doInteraction}
            onKeyDown={doInteraction}
            onTouchStart={doInteraction}
            onMouseDown={doInteraction}
        >
            <div
                ref={containerRef}
                className={style.container}
                onScroll={doScroll}
            >
                <div className={style.topSpacer} />
                <FeedSpacer size={viewed - 4} />
                {images.map((img, ix) => (
                    <IImage
                        key={ix}
                        id={img}
                        onLike={doLike}
                        onFollow={doFollow}
                        onShare={doShare}
                        onComment={doComment}
                        active={active && (ix === viewed || (ix === 0 && viewed === -1))}
                        visible={Math.abs(ix - viewed) < 5}
                    />
                ))}
                <FeedSpacer size={images.length - viewed - 5} />
                <div className={style.bottomSpacer}>
                    <CircularProgress />
                </div>
            </div>
        </div>
    );
}
