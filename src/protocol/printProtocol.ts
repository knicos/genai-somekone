import { ContentLogEntry } from '@genaism/common/components/ActionLogTable';
import { WeightedImage } from '@genaism/common/visualisations/ImageCloud/ImageCloud';
import { TopicData } from '@genaism/common/views/UserProfile/TopicDetail';
import { TopicSummary } from '@genaism/common/views/UserProfile/topicSummary';
import { UserNodeData, UserNodeId, WeightedLabel } from '@genai-fi/recom';

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
