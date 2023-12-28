import { PeerEvent, BuiltinEvent } from '@genaism/hooks/peer';
import { SMConfig } from '@genaism/views/Genagram/smConfig';
import { LogEntry, ProfileSummary } from '@genaism/services/profiler/profilerTypes';
import { UserNodeId } from '@genaism/services/graph/graphTypes';
import { ScoredRecommendation } from '@genaism/services/recommender/recommenderTypes';
import { Snapshot } from '@genaism/services/users/users';

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

export interface RecommendationEvent extends PeerEvent {
    event: 'eter:recommendations';
    id: UserNodeId;
    recommendations: ScoredRecommendation[];
}

export interface ActionLogEvent extends PeerEvent {
    event: 'eter:action_log';
    id: UserNodeId;
    log: LogEntry[];
}

export interface ResearchLogEvent extends PeerEvent {
    event: 'researchlog';
    action: string;
    timestamp: number;
    userId: UserNodeId;
    details: unknown;
}

export interface SnapshotEvent extends PeerEvent {
    event: 'eter:snapshot';
    id: UserNodeId;
    snapshot?: Snapshot;
}

export type EventProtocol =
    | BuiltinEvent
    | SnapshotEvent
    | RecommendationEvent
    | ProfileEvent
    | UserRegistrationEvent
    | ConfigurationEvent
    | ResearchLogEvent
    | ActionLogEvent;
