import { ContentLogEntry } from '@genaism/components/ActionLogTable';
import { WeightedImage } from '@genaism/visualisations/ImageCloud/ImageCloud';
import { TopicData } from '@genaism/views/UserProfile/TopicDetail';
import { TopicSummary } from '@genaism/views/UserProfile/topicSummary';
import { UserNodeData, UserNodeId, WeightedLabel } from '@knicos/genai-recom';

interface PrintProfiles {
    user: UserNodeId;
    profile: UserNodeData;
}

export interface PrintData {
    title: string;
    weightedImages?: WeightedImage[];
    actionLog?: ContentLogEntry[];
    profiles?: PrintProfiles[];
    engagement?: number;
    topics?: TopicData[];
    wordCloud?: WeightedLabel[];
    summary?: TopicSummary;
}
