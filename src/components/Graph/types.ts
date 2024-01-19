import { NodeID } from '@genaism/services/graph/graphTypes';

export interface GraphNode<T extends NodeID> {
    size: number;
    strength?: number;
    id: T;
    x?: number;
    y?: number;
    index?: number;
    fx?: number;
    fy?: number;
    data?: Record<string, string | number | boolean | object>;
}

export interface GraphLink<A extends NodeID, B extends NodeID> {
    source: A;
    target: B;
    strength: number;
    actualStrength?: number;
}

export interface InternalGraphLink<A extends NodeID, B extends NodeID> {
    source: GraphNode<A>;
    target: GraphNode<B>;
    strength: number;
    actualStrength?: number;
}

type StyleMappingFn<T extends NodeID, R> = (l: InternalGraphLink<T, T>) => R;
type StyleMapping<T extends NodeID, R> = R | StyleMappingFn<T, R>;

export interface LinkStyle<T extends NodeID> {
    className?: StyleMapping<T, string>;
    opacity?: StyleMapping<T, number>;
    width?: StyleMapping<T, number>;
    colour?: StyleMapping<T, string>;
}
