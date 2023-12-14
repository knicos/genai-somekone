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

function getRTConfig(resolve: (value: CommunicationRelayConfiguration) => void) {
    fetch(`${import.meta.env.VITE_APP_APIURL}/rtcconfig`)
        .then((response) => {
            if (response.ok) response.json().then(resolve);
            else setTimeout(() => getRTConfig(resolve), 1000);
        })
        .catch(() => {
            setTimeout(() => getRTConfig(resolve), 1000);
        });
}

export const iceConfig = selector<CommunicationRelayConfiguration>({
    key: 'iceConfig',
    get: () => {
        return new Promise((resolve) => {
            getRTConfig(resolve);
        });
        /*try {
            const response = await fetch(`${import.meta.env.VITE_APP_APIURL}/rtcconfig`);
            if (response.ok) {
                return response.json();
            } else {
                return null;
            }
        } catch (e) {
            console.error(e);
            return null;
        }*/
    },
});
