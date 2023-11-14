import React, { useRef, useCallback, useState, useEffect } from 'react';
import IImage from '../FeedImage/FeedImage';
import style from './style.module.css';
import CircularProgress from '@mui/material/CircularProgress';
import { LogActivity, LogEntry } from '../../services/profiler/profilerTypes';
import { LikeKind } from '../FeedImage/LikePanel';
import { ShareKind } from '../FeedImage/SharePanel';
import FeedSpacer from './FeedSpacer';

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
    const canMoreRef = useRef(true);
    const durationRef = useRef<number>(0);
    const [active, setActive] = useState(false);

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
            const norm = Math.max(0, Math.min(10, (delta - 1000) / 10000.0));
            // onView(prevRef.current, norm);
            onLog({ activity: 'dwell', value: norm, id: images[viewed], timestamp: Date.now() });
            //}
        }
        startRef.current = now;
        prevRef.current = viewed;
    }, [viewed, onView, onLog, images]);

    const doScroll = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            const imgIndex = Math.round(
                (e.currentTarget.scrollTop / (e.currentTarget.scrollHeight - e.currentTarget.clientHeight)) *
                    (images.length - 1)
            );
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

    const doLeave = useCallback(() => {
        setActive(false);
        onLog({ activity: 'end', timestamp: Date.now(), value: Date.now() - durationRef.current });
    }, [onLog]);

    const doEnter = useCallback(() => {
        setActive(true);
        onLog({ activity: 'begin', timestamp: Date.now() });
        durationRef.current = Date.now();
    }, [onLog]);

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
            onMouseLeave={doLeave}
            onMouseEnter={doEnter}
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
