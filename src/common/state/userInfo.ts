import { Connection } from '@genai-fi/base';
import { EventProtocol } from '@genaism/protocol/protocol';
import { UserNodeId } from '@knicos/genai-recom';

export interface UserInfo {
    username: string;
    connection: Connection<EventProtocol>;
    id: UserNodeId;
}
