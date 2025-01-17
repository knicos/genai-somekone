import { useContent, useContentComments } from '@genaism/hooks/content';
import style from './style.module.css';
import { ContentNodeId } from '@knicos/genai-recom';
import { useServices } from '@genaism/hooks/services';
import { Comment, CommentBox } from '@genaism/components/FeedImage';
import FavoriteIcon from '@mui/icons-material/Favorite';

interface Props {
    id: ContentNodeId;
}

export default function ImageDetail({ id }: Props) {
    const [, data] = useContent(id);
    const { content: contentSvc, profiler, actionLog } = useServices();
    const stats = contentSvc.getContentStats(id);
    const comments = useContentComments(id);

    return (
        <div className={style.outerContainer}>
            <div
                className={style.container}
                tabIndex={0}
            >
                <img
                    src={data}
                    alt=""
                />
                <div className={style.details}>
                    <div className={style.reactions}>
                        <FavoriteIcon htmlColor="#444" />
                        <span>{stats?.reactions || 0} likes</span>
                    </div>
                    <div className={style.comments}>
                        <CommentBox
                            id={id}
                            onComment={(comment: string) => {
                                actionLog.addLogEntry(
                                    {
                                        activity: 'comment',
                                        id,
                                        content: comment,
                                        value: comment.length,
                                        timestamp: Date.now(),
                                    },
                                    profiler.getCurrentUser()
                                );
                            }}
                        />
                        {comments &&
                            comments.map((c, ix) => (
                                <Comment
                                    key={ix}
                                    comment={c.comment}
                                    user={c.userId}
                                />
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
