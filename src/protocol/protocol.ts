import { PeerEvent, BuiltinEvent } from '@genaism/hooks/peer';
import { SMConfig } from '@genaism/views/Genagram/smConfig';
import { LogEntry, ProfileSummary } from '@genaism/services/profiler/profilerTypes';

export interface ConfigurationEvent extends PeerEvent {
    event: 'eter:config';
    configuration: SMConfig;
}

export interface UserRegistrationEvent extends PeerEvent {
    event: 'eter:reguser';
    username: string;
    id: string;
}

export interface ProfileEvent extends PeerEvent {
    event: 'eter:profile_data';
    id: string;
    profile: ProfileSummary;
}

export interface ActionLogEvent extends PeerEvent {
    event: 'eter:action_log';
    id: string;
    log: LogEntry[];
}

export type EventProtocol = BuiltinEvent | ProfileEvent | UserRegistrationEvent | ConfigurationEvent | ActionLogEvent;
