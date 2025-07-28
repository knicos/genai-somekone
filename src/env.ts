const url = import.meta.env.VITE_APP_APIURL || window.location.origin || 'http://localhost:9000';
const apiUrl = URL.parse(url);

const isSecure = apiUrl?.protocol === 'https:';
const host = apiUrl?.hostname || 'localhost';
const port = apiUrl?.port && apiUrl.port !== '' ? parseInt(apiUrl.port, 10) : isSecure ? 443 : 80;

const PeerEnv = {
    host,
    secure: isSecure,
    peerkey: import.meta.env.VITE_APP_PEER_KEY || 'genaikey',
    port,
    apiUrl: url,
};

export default PeerEnv;
