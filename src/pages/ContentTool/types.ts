import { ContentNodeId, TopicNodeId } from '@knicos/genai-recom';

type StageView = 'category' | 'refine' | 'images' | 'describe' | 'style' | 'colour' | 'confirm';

export interface StageState {
    view: StageView;
    contentId?: ContentNodeId;
    topicId?: TopicNodeId;
}
