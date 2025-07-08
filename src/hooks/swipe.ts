import { TouchEvent, useRef, useState } from 'react';

export type SwipeDirection = 'none' | 'left' | 'right';

export default function useSwipe() {
    const startRef = useRef<number | undefined>(undefined);
    const endRef = useRef<number | undefined>(undefined);
    const [direction, setDirection] = useState<SwipeDirection>('none');
    const [distance, setDistance] = useState(0);

    const minSwipeDistance = 50;

    const onTouchStart = (e: TouchEvent) => {
        endRef.current = undefined; // otherwise the swipe is fired even with usual touch events
        startRef.current = e.targetTouches[0].clientX;
    };

    const onTouchMove = (e: TouchEvent) => {
        endRef.current = e.targetTouches[0].clientX;

        if (!startRef.current || !endRef.current) return;
        const distance = startRef.current - endRef.current;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;
        if (isLeftSwipe) {
            setDirection('left');
            setDistance(distance);
        } else if (isRightSwipe) {
            setDirection('right');
            setDistance(distance);
        } else {
            setDirection('none');
        }
    };

    const onTouchEnd = () => {
        /*if (!startRef.current || !endRef.current) return;
        const distance = startRef.current - endRef.current;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;
        if (isLeftSwipe) {
            setDirection('left');
            setDistance(distance);
        } else if (isRightSwipe) {
            setDirection('right');
            setDistance(distance);
        } else {
            setDirection('none');
        }*/
        // add your conditional logic here

        setDirection('none');
    };
    return { onTouchStart, onTouchMove, onTouchEnd, swipe: direction, distance };
}
