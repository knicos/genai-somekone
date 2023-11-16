import { PeerEvent } from '../hooks/peer';
import { SMConfig } from '../views/Genagram/smConfig';

export interface ConfigurationEvent extends PeerEvent {
    event: 'eter:config';
    configuration: SMConfig;
}

export interface UserRegistrationEvent extends PeerEvent {
    event: 'eter:reguser';
    username: string;
}

export interface JoinEvent extends PeerEvent {
    event: 'eter:join';
}

export interface CloseEvent extends PeerEvent {
    event: 'eter:close';
}

export type EventProtocol = CloseEvent | JoinEvent | UserRegistrationEvent | ConfigurationEvent;
