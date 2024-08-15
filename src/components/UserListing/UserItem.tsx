import { useServices } from '@genaism/hooks/services';
import { UserNodeId } from '@knicos/genai-recom';
import style from './style.module.css';

interface Props {
    id: UserNodeId;
    onSelect: () => void;
    colour?: string;
}

export default function UserItem({ id, onSelect, colour }: Props) {
    const { content, profiler } = useServices();

    const data = profiler.getUserData(id);

    return (
        <li>
            <button
                onClick={onSelect}
                aria-label={data?.name || 'Missing name'}
            >
                {data?.image ? (
                    <img
                        src={content.getContentData(data.image)}
                        alt=""
                        width={50}
                        height={50}
                        style={{ borderColor: colour || '#444' }}
                    />
                ) : (
                    <div className={style.placeholderImage} />
                )}
                {data?.name}
            </button>
        </li>
    );
}
