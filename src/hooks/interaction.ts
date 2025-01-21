import { interactionStatus } from '@genaism/state/interaction';
import { useEffect, useRef, useState } from 'react';
import { useRecoilState } from 'recoil';

export function useTabActive() {
    const [active, setActive] = useState(true);
    useEffect(() => {
        const doWindowBlur = () => {
            setActive(false);
        };
        const doWindowFocus = () => {
            setActive(true);
        };
        window.addEventListener('blur', doWindowBlur);
        window.addEventListener('focus', doWindowFocus);
        return () => {
            window.removeEventListener('blur', doWindowBlur);
            window.removeEventListener('focus', doWindowFocus);
        };
    }, [setActive]);
    return active;
}

export function useInteractionDetector(timeout: number) {
    const timeRef = useRef(0);
    const intervalRef = useRef(-1);
    const [status, setStatus] = useRecoilState(interactionStatus);
    const tabActive = useTabActive();

    useEffect(() => {
        intervalRef.current = window.setInterval(() => {
            if (navigator.userActivation) {
                setStatus(navigator.userActivation.isActive && tabActive);
            } else {
                setStatus(Date.now() - timeRef.current > timeout && tabActive);
            }
        }, 200);
        return () => {
            if (intervalRef.current >= 0) clearInterval(intervalRef.current);
        };
    }, [setStatus, tabActive, timeout]);

    useEffect(() => {
        const detect = () => {
            timeRef.current = Date.now();
        };
        document.body.addEventListener('mousemove', detect);
        document.body.addEventListener('scroll', detect);
        document.body.addEventListener('touchstart', detect);

        return () => {
            document.body.removeEventListener('mousemove', detect);
            document.body.removeEventListener('scroll', detect);
            document.body.removeEventListener('touchstart', detect);
        };
    }, []);

    return status;
}
