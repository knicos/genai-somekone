import { ContentNodeId, TopicNodeId } from '@genaism/services/graph/graphTypes';

type StageView = 'category' | 'refine' | 'images' | 'describe' | 'style' | 'colour' | 'confirm';

export interface StageState {
    view: StageView;
    contentId?: ContentNodeId;
    topicId?: TopicNodeId;
}
