import { EventProtocol } from '@genaism/protocol/protocol';
import { Connection } from '@knicos/genai-base/main/services/peer2peer/types';
import { UserNodeId } from '@knicos/genai-recom';

export interface UserInfo {
    username: string;
    connection: Connection<EventProtocol>;
    id: UserNodeId;
}
