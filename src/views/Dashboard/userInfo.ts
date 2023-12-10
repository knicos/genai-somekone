import { UserNodeId } from '@genaism/services/graph/graphTypes';
import { DataConnection } from 'peerjs';

export interface UserInfo {
    username: string;
    connection: DataConnection;
    id: UserNodeId;
}
