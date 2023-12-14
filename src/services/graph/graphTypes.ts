export type EdgeType =
    | 'content'
    | 'topic'
    | 'similar'
    | 'liked'
    | 'shared'
    | 'comment'
    | 'engaged'
    | 'last_engaged'
    | 'common_attribute'
    | 'parent'
    | 'child'
    | 'seen'
    | 'seen_topic'
    | 'engaged_topic'
    | 'commented_topic'
    | 'shared_topic'
    | 'reacted_topic'
    | 'followed_topic'
    | 'viewed_topic';

export type NodeType = 'content' | 'topic' | 'user' | 'attribute' | 'special';

export type NodeID<T extends NodeType = NodeType> = `${T}:${string}`;
export type ContentNodeId = NodeID<'content'>;
export type TopicNodeId = NodeID<'topic'>;
export type UserNodeId = NodeID<'user'>;

export interface GNode<A extends NodeType> {
    id: NodeID<A>;
    type: A;
    data?: unknown;
}

export interface Edge<A extends NodeID<NodeType> = NodeID, B extends NodeID<NodeType> = NodeID> {
    type: EdgeType;
    weight: number;
    source: A;
    destination: B;
    metadata: unknown;
    timestamp: number;
}

export interface WeightedNode<A extends NodeID<NodeType>> {
    id: A;
    weight: number;
}

// All of the allowed edges
type GenericEdge<A extends EdgeType, B extends NodeID<NodeType>, C extends NodeID<NodeType>> = [A, B, C];
type ContentTopicEdge = GenericEdge<'topic', ContentNodeId, TopicNodeId>;
type TopicContentEdge = GenericEdge<'content', TopicNodeId, ContentNodeId>;
type SeenContentEdge = GenericEdge<'seen', UserNodeId, ContentNodeId>;
type ContentCommentedByUserEdge = GenericEdge<'comment', ContentNodeId, UserNodeId>;
type UserEngagedContentEdge = GenericEdge<'engaged', UserNodeId, ContentNodeId>;
type UserLastEngagedContentEdge = GenericEdge<'last_engaged', UserNodeId, ContentNodeId>;
type UserLikedContentEdge = GenericEdge<'liked', UserNodeId, ContentNodeId>;
type UserCommentedContentEdge = GenericEdge<'comment', UserNodeId, ContentNodeId>;
type ContentEngagedByUserEdge = GenericEdge<'engaged', ContentNodeId, UserNodeId>;
type UserEngagedTopicEdge = GenericEdge<'engaged_topic', UserNodeId, TopicNodeId>;
type TopicEngagedByUserEdge = GenericEdge<'engaged', TopicNodeId, UserNodeId>;
type UserTopicEdge = GenericEdge<'topic', UserNodeId, TopicNodeId>;
type TopicUserEdge = GenericEdge<'topic', TopicNodeId, UserNodeId>;
type UserCommentTopicEdge = GenericEdge<'commented_topic', UserNodeId, TopicNodeId>;
type UserSeenTopicEdge = GenericEdge<'seen_topic', UserNodeId, TopicNodeId>;
type UserSharedTopicEdge = GenericEdge<'shared_topic', UserNodeId, TopicNodeId>;
type UserFollowedTopicEdge = GenericEdge<'followed_topic', UserNodeId, TopicNodeId>;
type UserViewedTopicEdge = GenericEdge<'viewed_topic', UserNodeId, TopicNodeId>;
type UserReactedTopicEdge = GenericEdge<'reacted_topic', UserNodeId, TopicNodeId>;
type TopicChildEdge = GenericEdge<'child', TopicNodeId, TopicNodeId>;
type TopicParentEdge = GenericEdge<'parent', TopicNodeId, TopicNodeId>;

export type EdgeTypes =
    | ContentTopicEdge
    | TopicContentEdge
    | SeenContentEdge
    | ContentCommentedByUserEdge
    | UserEngagedContentEdge
    | UserLastEngagedContentEdge
    | UserLikedContentEdge
    | UserCommentedContentEdge
    | ContentEngagedByUserEdge
    | UserEngagedTopicEdge
    | TopicEngagedByUserEdge
    | UserTopicEdge
    | TopicUserEdge
    | UserCommentTopicEdge
    | UserSeenTopicEdge
    | UserSharedTopicEdge
    | UserFollowedTopicEdge
    | UserViewedTopicEdge
    | UserReactedTopicEdge
    | TopicParentEdge
    | TopicChildEdge;
export type BiEdgeTypes =
    | UserEngagedContentEdge
    | ContentEngagedByUserEdge
    | UserEngagedTopicEdge
    | TopicEngagedByUserEdge
    | TopicUserEdge
    | UserTopicEdge;

export type SourceFor<K, T = EdgeTypes> = T extends EdgeTypes ? (K extends T[0] ? T[1] : never) : never;
export type DestinationFor<K, S, T = EdgeTypes> = T extends EdgeTypes
    ? K extends T[0]
        ? S extends T[1]
            ? T[2]
            : never
        : never
    : never;

export function isContentID(id: string): id is ContentNodeId {
    return id.startsWith('content:');
}

export function isUserID(id: string): id is UserNodeId {
    return id.startsWith('user:');
}

export function isTopicID(id: string): id is TopicNodeId {
    return id.startsWith('topic:');
}
