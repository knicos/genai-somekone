import { useRef, useEffect, useState } from 'react';
import { Peer as P2P, DataConnection } from 'peerjs';

export interface PeerEvent {
    event: string;
    peers?: string[];
}

function isPeerEvent(data: unknown): data is PeerEvent {
    return typeof (data as PeerEvent).event === 'string';
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

interface PeerState {
    connections: Map<string, DataConnection>;
    peers: Set<string>;
    sender?: (data: unknown) => void;
}

interface PeerReturn<T> {
    send?: (data: T) => void;
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
    const connRef = useRef<PeerState>();
    const cbRef = useRef<Callbacks<T>>({});
    const [webrtc, setWebRTC] = useState(false);
    const [sender, setSender] = useState<(data: unknown) => void>();

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

        const npeer = new P2P(code, {
            host: import.meta.env.VITE_APP_PEER_SERVER,
            secure: import.meta.env.VITE_APP_PEER_SECURE === '1',
            key: import.meta.env.VITE_APP_PEER_KEY || 'peerjs',
            port: import.meta.env.VITE_APP_PEER_PORT ? parseInt(import.meta.env.VITE_APP_PEER_PORT) : 443,
            debug: 0,
            // config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }], sdpSemantics: 'unified-plan' },
            // config: { iceServers: [] },
        });
        setPeer(npeer);

        connRef.current = {
            connections: new Map<string, DataConnection>(),
            peers: new Set<string>(),
        };

        console.log('Constructed peer');

        npeer.on('open', () => {
            console.log('Open peer');
            if (cbRef.current.onOpen) {
                cbRef.current.onOpen();
            }
            setSender(() => (data: unknown) => {
                if (connRef.current) {
                    for (const conn of connRef.current.connections.values()) {
                        if (conn.open) conn.send(data);
                    }
                }
            });
            if (server) {
                const conn = npeer.connect(server, { reliable: true });
                console.log('CONN ID', conn.connectionId, conn);
                if (conn.open) {
                    console.log('Already open');
                }
                conn.on('open', () => {
                    console.log('Joining session');
                    connRef.current?.connections.set(conn.connectionId, conn);
                    connRef.current?.peers.add(conn.peer);
                    conn.send({ event: 'eter:join' });
                    if (cbRef.current.onConnect) cbRef.current.onConnect(conn);
                    setSender(() => (s: unknown) => {
                        conn.send(s);
                    });
                });
                conn.on('data', async (data: unknown) => {
                    if (isPeerEvent(data)) {
                        if (data.event === 'peers') {
                            console.log('GOT PEERS', data.peers);
                        } else {
                            if (cbRef.current.onData) cbRef.current.onData(data as T, conn);
                        }
                    }
                });
                conn.on('error', (err: Error) => {
                    console.error(err);
                    if (cbRef.current.onError) cbRef.current.onError(err);
                });
                conn.on('close', () => {
                    connRef.current?.connections.delete(conn.connectionId);
                    connRef.current?.peers.delete(conn.peer); // TODO: Check no other connections from peer
                    console.log('Connection closed');
                    if (cbRef.current.onClose) cbRef.current.onClose(conn);
                });
            }
        });
        npeer.on('close', () => {
            if (cbRef.current.onClose) cbRef.current.onClose();
        });
        npeer.on('connection', (conn) => {
            console.log('CONN ID', conn.connectionId, conn);
            conn.on('data', async (data: unknown) => {
                if (isPeerEvent(data)) {
                    if (data.event === 'peers') {
                        console.log('GOT PEERS', data.peers);
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

            if (conn.open) {
                console.log('Already open');
            }

            conn.on('open', () => {
                console.log('Connection opened');
                connRef.current?.connections.set(conn.connectionId, conn);
                connRef.current?.peers.add(conn.peer);
                if (connRef.current) {
                    for (const conn of connRef.current.connections.values()) {
                        if (conn.open) conn.send({ event: 'peers', peers: Array.from(connRef.current.peers) });
                    }
                }
                conn.send({ event: 'eter:welcome' });
            });

            conn.on('close', () => {
                console.log('Connection closed');
                connRef.current?.connections.delete(conn.connectionId);
                connRef.current?.peers.delete(conn.peer);
            });
        });

        npeer.on('disconnected', (id) => {
            console.log('Disconnected', id);
            /*const conn = connRef.current?.connections.get(id);
            if (conn) {
                connRef.current?.peers.delete(conn.peer);
                connRef.current?.connections.delete(id);
            }*/
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
                    setTimeout(() => npeer.reconnect(), 1000);
                    break;
                case 'server-error':
                    setTimeout(() => npeer.reconnect(), 5000);
                    break;
                case 'unavailable-id':
                    // setCode(randomId(8));
                    npeer.destroy();
                    setPeer(undefined);
                    break;
                case 'browser-incompatible':
                    console.error('Your browser does not support WebRTC');
                    break;
                default:
                    npeer.destroy();
                    setPeer(undefined);
            }
        });
        return () => {
            if (connRef.current) {
                connRef.current.connections.forEach((c) => c.close());
            }
            npeer.destroy();
            console.log('Destroyed old peer');
        };
    }, [code, server, webrtc]);

    useEffect(() => {
        const tabClose = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            if (connRef.current?.sender) connRef.current?.sender({ event: 'eter:close' });
        };
        window.addEventListener('beforeunload', tabClose);
        navigator?.mediaDevices?.getUserMedia({ video: true }).then((stream) => {
            stream.getTracks().forEach(function (track) {
                track.stop();
            });
            setWebRTC(true);
        });

        return () => {
            window.removeEventListener('beforeunload', tabClose);
        };
    }, []);

    return {
        send: sender,
        ready: !!sender,
        peer,
    };
}
