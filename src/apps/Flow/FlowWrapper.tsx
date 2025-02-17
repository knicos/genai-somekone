import { useProfilerService } from '@genaism/hooks/services';
import { useFeedProtocol } from '../../protocol/FeedProtocol';
import Workflow from '@genaism/common/views/Workflow/Workflow';

export default function FlowWrapper() {
    const { doProfile, doRecommend } = useFeedProtocol();
    const profiler = useProfilerService();

    return (
        <Workflow
            onProfile={doProfile}
            onRecommend={doRecommend}
            id={profiler.getCurrentUser()}
            hideFeedMenu
        />
    );
}
