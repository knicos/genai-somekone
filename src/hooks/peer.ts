import { useRef, useEffect, useState } from 'react';
import { Peer as P2P, DataConnection, PeerError } from 'peerjs';
import { iceConfig, webrtcActive } from '@genaism/state/webrtcState';
import { useRecoilRefresher_UNSTABLE, useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { errorNotification } from '@genaism/state/errorState';

export interface PeerEvent {
    event: string;
}

interface Callbacks<T> {
    onOpen?: () => void;
    onConnect?: (conn: DataConnection) => void;
    onClose?: (conn?: DataConnection) => void;
    onError?: (e: unknown) => void;
    onData?: (data: T, conn: DataConnection) => void;
}

interface Props<T> extends Callbacks<T> {
    code?: string;
    server?: string;
}

export type PeerProps<T> = Props<T>;

interface PeerCloseEvent extends PeerEvent {
    event: 'eter:close';
}

interface PeerJoinEvent extends PeerEvent {
    event: 'eter:join';
}

interface PeerWelcomeEvent extends PeerEvent {
    event: 'eter:welcome';
}

interface PeerChainEvent extends PeerEvent {
    event: 'eter:connect';
    code: string;
}

export type BuiltinEvent = PeerWelcomeEvent | PeerCloseEvent | PeerJoinEvent | PeerChainEvent;

function isPeerEvent(data: unknown): data is BuiltinEvent {
    return typeof (data as PeerEvent).event === 'string';
}

export type SenderType<T> = (data: T | BuiltinEvent) => void;

interface PeerState<T> {
    connections: Map<string, DataConnection>;
    peers: Set<string>;
    sender?: SenderType<T>;
}

interface PeerReturn<T> {
    send?: SenderType<T>;
    ready: boolean;
    peer?: P2P;
}

export default function usePeer<T extends PeerEvent>({
    code,
    server,
    onOpen,
    onClose,
    onError,
    onData,
    onConnect,
}: Props<T>): PeerReturn<T> {
    const [peer, setPeer] = useState<P2P>();
    const connRef = useRef<PeerState<T>>();
    const cbRef = useRef<Callbacks<T>>({});
    const [webrtc, setWebRTC] = useRecoilState(webrtcActive);
    const refreshRTC = useRecoilRefresher_UNSTABLE(iceConfig);
    const ice = useRecoilValue(iceConfig);
    const [sender, setSender] = useState<SenderType<T>>();
    const setError = useSetRecoilState(errorNotification);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        cbRef.current.onClose = onClose;
        cbRef.current.onOpen = onOpen;
        cbRef.current.onConnect = onConnect;
        cbRef.current.onError = onError;
        cbRef.current.onData = onData;
    }, [onData, onOpen, onClose, onError, onConnect]);

    if (connRef.current) {
        connRef.current.sender = sender;
    }

    useEffect(() => {
        if (!webrtc) return;
        if (!code) return;
        if (!ice) {
            setTimeout(() => {
                refreshRTC();
                setError((p) => {
                    const s = new Set(p);
                    s.delete('peer_nortc');
                    return s;
                });
            }, 5000);
            setError((p) => {
                const s = new Set(p);
                s.add('peer_nortc');
                return s;
            });
            return;
        }

        const npeer = new P2P(code, {
            host: import.meta.env.VITE_APP_PEER_SERVER,
            secure: import.meta.env.VITE_APP_PEER_SECURE === '1',
            key: import.meta.env.VITE_APP_PEER_KEY || 'peerjs',
            port: import.meta.env.VITE_APP_PEER_PORT ? parseInt(import.meta.env.VITE_APP_PEER_PORT) : 443,
            debug: 0,
            config: { iceServers: ice.iceServers, sdpSemantics: 'unified-plan' },
        });
        setPeer(npeer);

        connRef.current = {
            connections: new Map<string, DataConnection>(),
            peers: new Set<string>(),
        };

        const createPeer = (code: string) => {
            const conn = npeer.connect(code, { reliable: true });

            conn.on('open', () => {
                connRef.current?.connections.set(conn.connectionId, conn);
                connRef.current?.peers.add(conn.peer);
                conn.send({ event: 'eter:join' });
                if (cbRef.current.onConnect) cbRef.current.onConnect(conn);
                /*setSender(() => (s: T) => {
                        conn.send(s);
                    });*/
                setReady(true);
                setError((p) => {
                    const s = new Set(p);
                    s.delete('peer_failed');
                    s.delete('peer_retrying');
                    return s;
                });
            });
            conn.on('data', async (data: unknown) => {
                if (isPeerEvent(data)) {
                    if (data.event === 'eter:connect') {
                        createPeer(data.code);
                    } else {
                        if (cbRef.current.onData) cbRef.current.onData(data as T, conn);
                    }
                }
            });
            conn.on('error', (err: PeerError<string>) => {
                console.error(err.type);
                if (cbRef.current.onError) cbRef.current.onError(err);
                setError((p) => {
                    const s = new Set(p);
                    s.add('peer_failed');
                    return s;
                });
            });
            conn.on('close', () => {
                connRef.current?.connections.delete(conn.connectionId);
                connRef.current?.peers.delete(conn.peer); // TODO: Check no other connections from peer

                if (cbRef.current.onClose) cbRef.current.onClose(conn);
                setReady(false);

                // Retry
                setTimeout(() => {
                    if (npeer.destroyed) return;
                    createPeer(code);
                }, 1000);
            });
            conn.on('iceStateChanged', (state: RTCIceConnectionState) => {
                if (state === 'disconnected') {
                    conn.close();
                }
            });
        };

        npeer.on('open', () => {
            if (cbRef.current.onOpen) {
                cbRef.current.onOpen();
            }

            setSender(() => (data: T) => {
                if (connRef.current) {
                    for (const conn of connRef.current.connections.values()) {
                        if (conn.open) conn.send(data);
                    }
                }
            });
            if (server) {
                createPeer(server);
            } else {
                setReady(true);
                setError((p) => {
                    const s = new Set(p);
                    s.delete('peer_failed');
                    s.delete('peer_retrying');
                    return s;
                });
            }
        });
        npeer.on('close', () => {
            if (cbRef.current.onClose) cbRef.current.onClose();
        });
        npeer.on('connection', (conn) => {
            conn.on('data', async (data: unknown) => {
                if (isPeerEvent(data)) {
                    if (data.event === 'eter:connect') {
                        // console.log('GOT PEERS', data.peers);
                        createPeer(data.code);
                    } else {
                        if (cbRef.current.onData) {
                            cbRef.current.onData(data as T, conn);
                        }
                    }
                }
            });
            conn.on('error', (err: Error) => {
                console.error(err);
                if (cbRef.current.onError) cbRef.current.onError(err);
            });

            conn.on('open', () => {
                connRef.current?.connections.set(conn.connectionId, conn);
                connRef.current?.peers.add(conn.peer);
                if (connRef.current) {
                    for (const conn of connRef.current.connections.values()) {
                        if (conn.open) conn.send({ event: 'peers', peers: Array.from(connRef.current.peers) });
                    }
                }
                conn.send({ event: 'eter:welcome' });
            });

            conn.on('iceStateChanged', (state: RTCIceConnectionState) => {
                if (state === 'disconnected') {
                    conn.close();
                }
            });

            conn.on('close', () => {
                connRef.current?.connections.delete(conn.connectionId);
                connRef.current?.peers.delete(conn.peer);
                if (cbRef.current.onClose) cbRef.current.onClose(conn);
            });
        });

        npeer.on('disconnected', () => {
            /*const conn = connRef.current?.connections.get(id);
            if (conn) {
                connRef.current?.peers.delete(conn.peer);
                connRef.current?.connections.delete(id);
            }*/
            console.log('Peer discon');
        });

        npeer.on('close', () => {
            console.log('Peer close');
        });

        npeer.on('error', (err) => {
            const type: string = err.type;
            console.error('Peer', type, err);
            switch (type) {
                case 'disconnected':
                case 'network':
                    setError((p) => {
                        const s = new Set(p);
                        s.add('peer_retrying');
                        return s;
                    });
                    setTimeout(() => npeer.reconnect(), 1000);
                    break;
                case 'server-error':
                    setError((p) => {
                        const s = new Set(p);
                        s.add('peer_retrying');
                        return s;
                    });
                    setTimeout(() => npeer.reconnect(), 5000);
                    break;
                case 'unavailable-id':
                    // setCode(randomId(8));
                    npeer.destroy();
                    setError((p) => {
                        const s = new Set(p);
                        s.add('peer_failed');
                        return s;
                    });
                    setPeer(undefined);
                    break;
                case 'browser-incompatible':
                    console.error('Your browser does not support WebRTC');
                    setError((p) => {
                        const s = new Set(p);
                        s.add('peer_failed');
                        return s;
                    });
                    break;
                case 'peer-unavailable':
                    setError((p) => {
                        const s = new Set(p);
                        s.add('peer_no_peer');
                        return s;
                    });
                    setTimeout(() => {
                        if (server && !npeer.destroyed) createPeer(server);
                    }, 1000);
                    break;
                default:
                    npeer.destroy();
                    setError((p) => {
                        const s = new Set(p);
                        s.add('peer_failed');
                        return s;
                    });
                    setPeer(undefined);
            }
        });
        return () => {
            if (connRef.current) {
                connRef.current.connections.forEach((c) => c.close());
            }
            npeer.destroy();
        };
    }, [code, server, webrtc, ice, setError, refreshRTC]);

    useEffect(() => {
        const tabClose = () => {
            // e.preventDefault();
            if (connRef.current?.sender) connRef.current?.sender({ event: 'eter:close' });
        };
        window.addEventListener('beforeunload', tabClose);
        navigator?.mediaDevices
            ?.getUserMedia({ video: true })
            .then((stream) => {
                stream.getTracks().forEach(function (track) {
                    track.stop();
                });
                setWebRTC(true);
            })
            .catch(() => {
                setError((p) => {
                    const s = new Set(p);
                    s.add('peer_nowebcam');
                    return s;
                });
            });

        return () => {
            window.removeEventListener('beforeunload', tabClose);
        };
    }, [setError, setWebRTC]);

    return {
        send: sender,
        ready,
        peer,
    };
}
