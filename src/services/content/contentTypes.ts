import { UserNodeId } from '../graph/graphTypes';

export interface TextComponent {
    type: 'text';
    content: string;
    verticalPosition?: number;
    horizontalPosition?: number;
    alignment?: 'left' | 'right' | 'center';
    size?: number;
    color?: string;
    fontTemplate?: string;
}

export type ContentComponent = TextComponent;

export interface WeightedLabel {
    label: string;
    weight: number;
}

export interface ContentMetadata {
    id: string;
    caption?: string;
    author?: string;
    disableComments?: boolean;
    disableLikes?: boolean;
    disableShare?: boolean;
    sponsored?: boolean;
    labels: WeightedLabel[];
}

export interface ImageEntity {
    id: string;
    src: string;
    caption?: string;
    author?: string;
    disableComments?: boolean;
    disableLikes?: boolean;
    disableShare?: boolean;
    sponsored?: boolean;
    components?: ContentComponent[];
}

export interface CommentEntry {
    userId: UserNodeId;
    comment: string;
}
