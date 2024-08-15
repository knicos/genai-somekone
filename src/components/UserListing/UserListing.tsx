import { UserNodeId, WeightedLabel, WeightedNode } from '@knicos/genai-recom';
import { useAllSimilarUsers } from '../SocialGraph/similarity';
import { useNodeType } from '@genaism/hooks/graph';
import UserItem from './UserItem';
import style from './style.module.css';
import { colourLabel } from '../SocialGraph/colourise';
import { useProfilerService } from '@genaism/hooks/services';

function buildList(
    id: UserNodeId,
    all: UserNodeId[],
    similar: Map<UserNodeId, WeightedNode<UserNodeId>[]>,
    topics?: Map<UserNodeId, WeightedLabel>
) {
    const result: UserNodeId[] = [];
    const seen = new Set<UserNodeId>();
    const s = similar.get(id);
    if (s) {
        s.forEach((u) => {
            result.push(u.id);
            seen.add(u.id);
        });
    }
    const sorted = [...all];
    sorted.sort((a, b) => (topics?.get(a)?.label || 'zz').localeCompare(topics?.get(b)?.label || 'zz'));

    sorted.forEach((u) => {
        if (!seen.has(u)) {
            result.push(u);
        }
    });

    return result;
}

interface Props {
    onSelect: (id: UserNodeId) => void;
}

export default function UserListing({ onSelect }: Props) {
    const users = useNodeType('user');
    const similar = useAllSimilarUsers(users, true, 5);
    const profiler = useProfilerService();

    const sorted = buildList(profiler.getCurrentUser(), users, similar.similar, similar.topics);

    return (
        <div className={style.userSection}>
            <ul>
                {sorted.map((user) => (
                    <UserItem
                        key={user}
                        id={user}
                        onSelect={() => onSelect(user)}
                        colour={colourLabel(similar.topics?.get(user)?.label || 'nocluster')}
                    />
                ))}
            </ul>
        </div>
    );
}
