import { UserNodeId } from '@knicos/genai-recom';
import { DataConnection } from 'peerjs';

export interface UserInfo {
    username: string;
    connection: DataConnection;
    id: UserNodeId;
}
