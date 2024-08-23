import { ContentLogEntry } from '@genaism/components/ActionLogTable/LogBatch';
import { WeightedImage } from '@genaism/components/ImageCloud/ImageCloud';
import { TopicData } from '@genaism/components/UserProfile/TopicDetail';
import { TopicSummary } from '@genaism/components/UserProfile/topicSummary';
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
