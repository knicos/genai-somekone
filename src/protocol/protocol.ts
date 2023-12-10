import { PeerEvent, BuiltinEvent } from '@genaism/hooks/peer';
import { SMConfig } from '@genaism/views/Genagram/smConfig';
import { LogEntry, ProfileSummary } from '@genaism/services/profiler/profilerTypes';
import { UserNodeId } from '@genaism/services/graph/graphTypes';

export interface ConfigurationEvent extends PeerEvent {
    event: 'eter:config';
    configuration: SMConfig;
    content?: (string | ArrayBuffer)[];
}

export interface UserRegistrationEvent extends PeerEvent {
    event: 'eter:reguser';
    username: string;
    id: UserNodeId;
}

export interface ProfileEvent extends PeerEvent {
    event: 'eter:profile_data';
    id: UserNodeId;
    profile: ProfileSummary;
}

export interface ActionLogEvent extends PeerEvent {
    event: 'eter:action_log';
    id: UserNodeId;
    log: LogEntry[];
}

export type EventProtocol = BuiltinEvent | ProfileEvent | UserRegistrationEvent | ConfigurationEvent | ActionLogEvent;
