type RouteType = 'any' | 'nearest';

export interface CommunicationIceServer {
    urls: string[];
    username: string;
    credential: string;
    routeType: RouteType;
}

export interface CommunicationRelayConfiguration {
    expiresOn: Date;
    iceServers: CommunicationIceServer[];
}

export function getRTConfig(resolve: (value: CommunicationRelayConfiguration) => void) {
    fetch(`${import.meta.env.VITE_APP_APIURL}/rtcconfig`)
        .then((response) => {
            if (response.ok) response.json().then(resolve);
            else setTimeout(() => getRTConfig(resolve), 1000);
        })
        .catch(() => {
            setTimeout(() => getRTConfig(resolve), 1000);
        });
}
