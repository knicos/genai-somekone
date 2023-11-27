export type EdgeType =
    | 'content'
    | 'topic'
    | 'similar'
    | 'liked'
    | 'shared'
    | 'comment'
    | 'engaged'
    | 'common_attribute'
    | 'parent'
    | 'child'
    | 'seen_topic'
    | 'engaged_topic';

export type NodeType = 'content' | 'topic' | 'user' | 'attribute';

export interface GNode {
    id: string;
    type: NodeType;
}

export interface Edge {
    type: EdgeType;
    weight: number;
    source: string;
    destination: string;
    metadata: unknown;
}

export interface WeightedNode {
    id: string;
    weight: number;
}
