import { atom } from 'jotai';

type PeerErrorType = 'peer_failed' | 'peer_retrying' | 'peer_no_peer' | 'peer_nortc' | 'peer_nowebcam';
type ErrorType =
    | 'none'
    | PeerErrorType
    | 'content_not_found'
    | 'missing_dependency'
    | 'missing_embeddings'
    | 'missing_points'
    | 'missing_cluster';

export const errorNotification = atom<Set<ErrorType>>(new Set<ErrorType>());
