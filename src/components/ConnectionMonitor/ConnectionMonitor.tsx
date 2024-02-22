import { iceConfig, webrtcActive, webrtcCandidate } from '@genaism/state/webrtcState';
import { useEffect, useRef } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import PermissionDialog from './PermissionDialog';
import { getRTConfig } from './ice';
import IceDialog from './IceDialog';
import ConnectionError from './ConnectionError';
import { PeerErrorType, PeerStatus } from '@genaism/hooks/peer';
import ProgressDialog from './ProgressDialog';
import CandidateDialog from './CandidateDialog';

interface Props {
    ready?: boolean;
    status?: PeerStatus;
    error?: PeerErrorType;
}

export default function ConnectionMonitor({ ready, status, error }: Props) {
    const [ice, setIce] = useRecoilState(iceConfig);
    const [webrtc, setWebRTC] = useRecoilState(webrtcActive);
    const candidate = useRecoilValue(webrtcCandidate);
    const streamRef = useRef<MediaStream | undefined>();

    // Get ICE servers
    useEffect(() => {
        if (!ice) {
            getRTConfig((data) => {
                setIce(data);
            });
        }
    }, [ice, setIce]);

    // Get permissions for webRTC
    useEffect(() => {
        if (ice && webrtc === 'unset') {
            navigator?.mediaDevices
                ?.getUserMedia({ video: true })
                .then((stream) => {
                    streamRef.current = stream;
                    setWebRTC('full');
                })
                .catch(() => {
                    setWebRTC('relay');
                });
        }
    }, [ice, webrtc, setWebRTC]);

    // Stop the webcam after connection is ready (for Firefox)
    useEffect(() => {
        if (ready && streamRef.current) {
            streamRef.current.getTracks().forEach(function (track) {
                track.stop();
            });
            streamRef.current = undefined;
        }
    }, [ready]);

    return (
        <>
            <IceDialog open={!ice} />
            <PermissionDialog open={ice && webrtc === 'unset'} />
            <ProgressDialog status={status} />
            <CandidateDialog relay={candidate === 'relay'} />
            <ConnectionError
                error={error}
                hasError={status === 'failed'}
            />
        </>
    );
}
