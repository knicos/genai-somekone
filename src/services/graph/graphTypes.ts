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
    | 'child';

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
    metadata: any;
}

export interface WeightedNode {
    id: string;
    weight: number;
}
