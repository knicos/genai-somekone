import { PeerEvent, BuiltinEvent } from '@genaism/hooks/peer';
import { SMConfig } from '@genaism/views/Genagram/smConfig';
import { LogEntry, UserProfile } from '@genaism/services/profiler/profilerTypes';
import { ContentNodeId, UserNodeId } from '@genaism/services/graph/graphTypes';
import { ScoredRecommendation } from '@genaism/services/recommender/recommenderTypes';
import { Snapshot } from '@genaism/services/users/users';
import { ContentStatsId } from '@genaism/services/content/contentTypes';

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

export interface UserEntry {
    name: string;
    id: UserNodeId;
}

export interface UserListEvent extends PeerEvent {
    event: 'eter:users';
    users: UserEntry[];
}

export interface ProfileEvent extends PeerEvent {
    event: 'eter:profile_data';
    id: UserNodeId;
    profile: UserProfile;
}

export interface RecommendationEvent extends PeerEvent {
    event: 'eter:recommendations';
    id: UserNodeId;
    recommendations: ScoredRecommendation[];
}

export interface ContentStatsEvent extends PeerEvent {
    event: 'eter:stats';
    content: ContentStatsId[];
    bestEngagement: number;
}

export interface ActionLogEvent extends PeerEvent {
    event: 'eter:action_log';
    id: UserNodeId;
    log: LogEntry[];
}

export interface CommentEvent extends PeerEvent {
    event: 'eter:comment';
    id: UserNodeId;
    contentId: ContentNodeId;
    comment: string;
    timestamp: number;
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
    | ContentStatsEvent
    | SnapshotEvent
    | RecommendationEvent
    | ProfileEvent
    | UserRegistrationEvent
    | ConfigurationEvent
    | ResearchLogEvent
    | UserListEvent
    | CommentEvent
    | ActionLogEvent;
