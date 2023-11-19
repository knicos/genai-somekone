import { atom, selector } from 'recoil';

export const webrtcActive = atom<boolean>({
    key: 'webrtc',
    default: false,
});

type RouteType = 'any' | 'nearest';

interface CommunicationIceServer {
    urls: string[];
    username: string;
    credential: string;
    routeType: RouteType;
}

interface CommunicationRelayConfiguration {
    expiresOn: Date;
    iceServers: CommunicationIceServer[];
}

export const iceConfig = selector<CommunicationRelayConfiguration | null>({
    key: 'iceConfig',
    get: async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_APP_APIURL}/rtcconfig`);
            if (response.ok) {
                return response.json();
            } else {
                return null;
            }
        } catch (e) {
            console.error(e);
            return null;
        }
    },
});
