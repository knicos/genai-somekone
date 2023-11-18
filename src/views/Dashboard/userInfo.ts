import { DataConnection } from 'peerjs';

export interface UserInfo {
    username: string;
    connection: DataConnection;
    id: string;
}
