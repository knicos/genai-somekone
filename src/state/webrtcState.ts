import { CommunicationRelayConfiguration } from '@genaism/components/ConnectionMonitor/ice';
import { atom } from 'recoil';

type WebRTCPermissions = 'unset' | 'full' | 'relay';

export const webrtcActive = atom<WebRTCPermissions>({
    key: 'webrtc',
    default: 'unset',
});

export const iceConfig = atom<CommunicationRelayConfiguration | undefined>({
    key: 'iceConfig',
    default: undefined,
});

export const webrtcCandidate = atom<'unset' | 'relay' | 'other'>({
    key: 'webrtccandidate',
    default: 'unset',
});
