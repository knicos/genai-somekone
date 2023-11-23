import { atom } from 'recoil';

type PeerErrorType = 'peer_failed' | 'peer_retrying' | 'peer_no_peer' | 'peer_nortc' | 'peer_nowebcam';
type ErrorType = 'none' | PeerErrorType | 'content_not_found';

export const errorNotification = atom<Set<ErrorType>>({
    key: 'errorNotification',
    default: new Set<ErrorType>(),
});
